import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Define CORS headers (DRY)
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // or your specific origin
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID, X-User-Email, Referer',
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: CORS_HEADERS,
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            timestamp,
            reportId,
            formattedContent,
        } = body;

        const emails = ['randy@randykelton.com', 'techguru0411@gmail.com'];

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_TLS === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Report Submission</h2>
            <p><strong>User Email:</strong> ${email}</p>
            <p><strong>Submission Time:</strong> ${timestamp}</p>
            <p><strong>Report ID:</strong> ${reportId}</p>
            <div style="margin: 20px 0;">
                ${formattedContent}
            </div>
            <p style="margin-top: 20px; color: #7f8c8d;">
                This is an automated notification from our system.
            </p>
        </div>
    `;

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: emails.filter((email) => email !== null),
            subject: 'Report',
            text: `Test Report`,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: `Email sent to ${emails.join(', ')} successfully` },
            { status: 200, headers: CORS_HEADERS }
        );
    } catch (error) {
        console.error('Sign Up error:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
