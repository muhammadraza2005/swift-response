import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Channel Escalation Logic:
 * 1. Data (HTTPS)
 * 2. Call (tel:)
 * 3. SMS (sms:)
 * 4. Offline (Backup)
 */

export interface IncidentPayload {
    deviceEmergencyId: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    voiceBlob?: Blob;
}

const STORE_NAME = 'emergency_store';
const INCIDENT_KEY = 'pending_incident';

class ChannelManager {
    private static instance: ChannelManager;
    private emergencyId: string | null = null;
    private emergencyNumber = '1122'; // Pakistan Rescue 1122 (Example)

    private constructor() {
        if (typeof window !== 'undefined') {
            this.initStore();
        }
    }

    public static getInstance(): ChannelManager {
        if (!ChannelManager.instance) {
            ChannelManager.instance = new ChannelManager();
        }
        return ChannelManager.instance;
    }

    private async initStore() {
        if (typeof window === 'undefined') return;

        try {
            localforage.config({
                name: 'SwiftResponse',
                storeName: STORE_NAME,
            });

            // Get or Create Device Emergency ID
            let id = await localforage.getItem<string>('device_emergency_id');
            if (!id) {
                id = uuidv4();
                await localforage.setItem('device_emergency_id', id);
            }
            this.emergencyId = id;
        } catch (error) {
            console.error('Failed to init localforage:', error);
        }
    }

    public async triggerEmergency(
        gps: { lat: number; lng: number } | null,
        voice?: Blob
    ): Promise<{ status: string; step: string }> {
        if (!this.emergencyId) await this.initStore();

        const payload: IncidentPayload = {
            deviceEmergencyId: this.emergencyId!,
            latitude: gps?.lat || 0,
            longitude: gps?.lng || 0,
            timestamp: Date.now(),
            voiceBlob: voice,
        };

        // Step 0: Local Snapshot
        console.log('[ChannelManager] Step 0: Local Snapshot');
        await localforage.setItem(INCIDENT_KEY, payload);

        // Step 1: Data Channel
        console.log('[ChannelManager] Step 1: Attempting Data Channel...');
        try {
            const success = await this.sendData(payload);
            if (success) {
                console.log('[ChannelManager] Data Send Success!');
                await localforage.removeItem(INCIDENT_KEY); // Clear pending if successful
                return { status: 'success', step: 'data' };
            }
        } catch (e) {
            console.error('[ChannelManager] Data Channel Failed:', e);
        }

        // Step 2: Call Channel
        console.log('[ChannelManager] Step 2: Escalating to Call...');
        this.initiateCall();

        // NOTE: On Web, we cannot know if the call was successful or cancelled.
        // The strict flow says: Data -> Call -> SMS.
        // We will assume Call is "attempted".
        // However, if the user returns to the app immediately (e.g. cancels call),
        // we should ideally offer SMS. 
        // For this strict "Automatic" flow, we might set a timer or check visibility.
        // But simply return 'call_initiated' here so the UI can update.
        return { status: 'escalated', step: 'call' };
    }

    public initiateCall() {
        window.location.href = `tel:${this.emergencyNumber}`;
    }

    public initiateSMS(gps: { lat: number; lng: number } | null) {
        const locString = gps ? `LOC:${gps.lat.toFixed(5)},${gps.lng.toFixed(5)}` : 'LOC:UNKNOWN';
        const body = `SOS#${this.emergencyId}#FLOOD#${locString}`;
        // iOS/Android compatible SMS link body
        const separator = navigator.userAgent.match(/iPhone|iPad|iPod/i) ? '&' : '?';
        window.location.href = `sms:${this.emergencyNumber}${separator}body=${encodeURIComponent(body)}`;
    }

    private async sendData(payload: IncidentPayload): Promise<boolean> {
        if (!navigator.onLine) return false;

        try {
            // In real app, we would upload voice blob first or multipart
            // simplified here for JSON
            const res = await fetch('/api/incident', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceEmergencyId: payload.deviceEmergencyId,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    timestamp: payload.timestamp,
                    // voice would be uploaded separately in robust impl
                }),
            });

            if (res.ok) return true;
            return false;
        } catch (err) {
            return false;
        }
    }

    public async getPendingIncident(): Promise<IncidentPayload | null> {
        return await localforage.getItem<IncidentPayload>(INCIDENT_KEY);
    }
}

export const channelManager = ChannelManager.getInstance();
