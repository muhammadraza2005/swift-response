import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/services/incident-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { From, Body } = body; // Twilio-style payload (simplified)

        if (!From || !Body) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Body format: "SOS#DEVICE_ID#FLOOD#LOC:LAT,LNG"
        // Regex to extract
        const idMatch = Body.match(/SOS#([^#]+)/);
        const locMatch = Body.match(/LOC:(-?\d+\.\d+),(-?\d+\.\d+)/);

        const deviceEmergencyId = idMatch ? idMatch[1] : 'UNKNOWN_SMS';
        const latitude = locMatch ? parseFloat(locMatch[1]) : 0;
        const longitude = locMatch ? parseFloat(locMatch[2]) : 0;

        await IncidentService.mergeOrCreate({
            deviceEmergencyId,
            phoneNumber: From,
            latitude,
            longitude,
            timestamp: Date.now(),
            source: 'sms'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('SMS Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
