import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/services/incident-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Caller, CellRegion } = body; // Simulated Telephony Provider payload

        // Call doesn't carry data usually, just Caller ID and Tower Coords (CellRegion)
        // We assume CellRegion is "Lat,Lng" string for simulation
        const [latStr, lngStr] = (CellRegion || "0,0").split(',');

        await IncidentService.mergeOrCreate({
            deviceEmergencyId: 'UNKNOWN_CALL', // Call channel rarely has Device ID unless IVR encoded
            phoneNumber: Caller,
            latitude: parseFloat(latStr),
            longitude: parseFloat(lngStr),
            timestamp: Date.now(),
            source: 'call'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Call Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
