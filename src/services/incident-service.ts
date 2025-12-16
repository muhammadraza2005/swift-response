import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Service Role for backend ops)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// WARNING: Ensure SUPABASE_SERVICE_ROLE_KEY is in .env.local

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface IncidentData {
    deviceEmergencyId: string;
    phoneNumber?: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    source: 'data' | 'sms' | 'call';
    voiceUrl?: string;
}

export class IncidentService {
    private static MERGE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

    static async mergeOrCreate(data: IncidentData) {
        const { deviceEmergencyId, phoneNumber, latitude, longitude, source, voiceUrl } = data;

        // 1. Find recent active incident for this Device OR Phone
        // We look for incidents created > Now - 10 mins
        const windowStart = new Date(Date.now() - this.MERGE_WINDOW_MS).toISOString();

        let query = supabase
            .from('incidents')
            .select('*')
            .or(`device_emergency_id.eq.${deviceEmergencyId},phone_number.eq.${phoneNumber || '000000000'}`) // Handle null phone
            .gt('created_at', windowStart)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);

        const { data: existing, error } = await query;

        if (error) {
            console.error('Error finding incident:', error);
            throw new Error('Database error');
        }

        if (existing && existing.length > 0) {
            // MERGE / UPDATE
            const incident = existing[0];
            console.log(`Merging incident ${incident.id} from source ${source}`);

            // Logic: Update location if confidence is better.
            // Data (GPS) > SMS (Tower/GPS) > Call (Tower)
            // For now, always update with latest if it's Data
            const updates: any = {
                // If incoming is Data, it's likely high accuracy
                // If incoming is SMS composed by App, it might have GPS
            };

            if (source === 'data') {
                updates.latitude = latitude;
                updates.longitude = longitude;
                updates.location_confidence = 'high';
                updates.source_channel = 'data'; // Upgrade channel
            }

            if (voiceUrl) {
                updates.voice_url = voiceUrl;
            }

            await supabase
                .from('incidents')
                .update(updates)
                .eq('id', incident.id);

            return { action: 'merged', id: incident.id };
        } else {
            // CREATE NEW
            console.log(`Creating new incident from ${source}`);
            const { data: newIncident, error: insertError } = await supabase
                .from('incidents')
                .insert({
                    device_emergency_id: deviceEmergencyId,
                    phone_number: phoneNumber,
                    latitude,
                    longitude,
                    location_confidence: source === 'data' ? 'high' : 'unknown',
                    source_channel: source,
                    status: 'pending',
                    voice_url: voiceUrl
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating incident:', insertError);
                throw insertError;
            }

            return { action: 'created', id: newIncident.id };
        }
    }
}
