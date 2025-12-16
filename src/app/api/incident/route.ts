import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/services/incident-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { deviceEmergencyId, latitude, longitude, timestamp, voiceUrl } = body;

        if (!deviceEmergencyId || latitude === undefined || longitude === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await IncidentService.mergeOrCreate({
            deviceEmergencyId,
            latitude,
            longitude,
            timestamp,
            source: 'data',
            voiceUrl
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
