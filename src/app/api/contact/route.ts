import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, email, message } = data;

        // Validate input
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Save to database
        const { error } = await supabase
            .from('contact')
            .insert([{ name, email, message }]);

        if (error) {
            console.error('Error saving contact:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to save message' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Message received successfully!' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process request' },
            { status: 500 }
        );
    }
}
