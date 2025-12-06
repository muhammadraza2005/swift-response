import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, email, message } = data;

        // Log the received data to the server console as required by the assignment
        console.log('--- Contact Form Submission ---');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Message:', message);
        console.log('-------------------------------');

        // In a real app, we would save this to a database

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
