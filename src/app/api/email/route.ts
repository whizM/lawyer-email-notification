import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            email,
            timestamp,
            reportId,
            reportLink
         } = body;
         
         const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_TLS === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: 'techguru0411@gmail.com',
            subject: 'Your Report',
            text: `Please find your report at the following link: ${reportLink}. \n \n Auth Email: ${email} \n Timestamp: ${timestamp} \n Report ID: ${reportId}`,
        };
        
        await transporter.sendMail(mailOptions);
        
        return NextResponse.json(
            { message: 'Email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Sign Up error:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}