import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/db';
interface Lawyer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    longitude?: string;
    latitude?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            timestamp,
            reportId,
            formattedContent,
            coordinates,
        } = body;

        const { lat, lon } = coordinates;

        const rawLawyers = await db.query.lawyers.findMany() as Lawyer[];
        const lawyersWithDistance = rawLawyers.map((lawyer) => {
            const distance = calculateDistance(lat, lon, Number(lawyer?.latitude ?? 0), Number(lawyer?.longitude ?? 0));
            return { ...lawyer, distance };
        });
        const sortedLawyers = lawyersWithDistance.filter((lawyer) => lawyer.distance < 100).sort((a, b) => a.distance - b.distance);
        const randomLawyers = sortedLawyers.slice(0, 10);

        const emails = randomLawyers.map((lawyer) => lawyer.email);
        console.log('emails', emails);
        // Fetch the first email template from database
        const emailTemplate = await db.query.emailTemplate.findFirst();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_TLS === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        let htmlContent = '';
        let emailSubject = 'Report Notification';

        if (emailTemplate && emailTemplate.content) {
            // Use the template and replace variables
            emailSubject = emailTemplate.subject || 'Report Notification';

            // Replace template variables with actual values
            htmlContent = emailTemplate.content
                .replace(/\{\{email\}\}/g, email || 'N/A')
                .replace(/\{\{timestamp\}\}/g, timestamp || new Date().toISOString())
                .replace(/\{\{reportId\}\}/g, reportId || 'N/A')
                .replace(/\{\{formattedContent\}\}/g, formattedContent || 'No content provided');
        } else {
            // Fallback template if no template exists in database
            htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">New Report Submission</h1>
                        <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">Automated notification from your system</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #007bff;">
                            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">Report Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6c757d; font-weight: 500; width: 140px;">User Email:</td>
                                    <td style="padding: 8px 0; color: #212529; font-weight: 600;">${email || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6c757d; font-weight: 500;">Submission Time:</td>
                                    <td style="padding: 8px 0; color: #212529; font-weight: 600;">${timestamp || new Date().toISOString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6c757d; font-weight: 500;">Report ID:</td>
                                    <td style="padding: 8px 0; color: #212529; font-weight: 600; font-family: 'Courier New', monospace; background-color: #e9ecef; padding: 4px 8px; border-radius: 4px;">${reportId || 'N/A'}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">Report Content</h3>
                        <div style="background-color: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; max-height: 300px; overflow-y: auto;">
                            ${formattedContent || '<p style="color: #6c757d; font-style: italic;">No content provided</p>'}
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #dee2e6; padding-top: 20px; text-align: center;">
                        <p style="color: #6c757d; margin: 0; font-size: 12px; line-height: 1.5;">
                            This is an automated notification from your lawyer management system.<br>
                            Please do not reply to this email.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #6c757d; font-size: 11px; margin: 0;">
                        © ${new Date().getFullYear()} Lawyer Management System. All rights reserved.
                    </p>
                </div>
            </div>
            `;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: emails.filter((email) => email !== null),
            subject: emailSubject,
            text: `New Report Submission from ${email}. Report ID: ${reportId}. Time: ${timestamp}`,
            html: htmlContent,
        };
        console.log('mailOptions', mailOptions);
        // await transporter.sendMail(mailOptions);

        // Send confirmation email with lawyer details to electronic paralegal
        const lawyerDetailsHtml = randomLawyers.map(lawyer => `
            <tr>
                <td style="padding: 10px; border: 1px solid #dee2e6;">
                    <strong>Name:</strong> ${lawyer.name || 'N/A'}<br>
                    <strong>Email:</strong> ${lawyer.email || 'N/A'}<br>
                    <strong>Phone:</strong> ${lawyer.phone || 'N/A'}<br>
                    <strong>Address:</strong> ${lawyer.address || 'N/A'}<br>
                    <strong>Distance:</strong> ${lawyer.distance.toFixed(2)} km
                </td>
            </tr>
        `).join('');

        const confirmationEmailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h2>Email Sending Confirmation</h2>
                <p>Hi, Randy. A report has been successfully distributed to the following lawyers:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tbody>
                        ${lawyerDetailsHtml}
                    </tbody>
                </table>
                <div style="margin-top: 20px;">
                    <p><strong>Report Details:</strong></p>
                    <ul>
                        <li>Report ID: ${reportId}</li>
                        <li>Submission Time: ${timestamp}</li>
                        <li>User Email: ${email}</li>
                    </ul>
                </div>
            </div>
        `;

        const confirmationMailOptions = {
            from: process.env.SMTP_FROM,
            to: 'email@electronicparalegal.com',
            subject: `Report Distribution Confirmation - Report ID: ${reportId}`,
            html: confirmationEmailHtml
        };

        await transporter.sendMail(confirmationMailOptions);

        return NextResponse.json(
            { message: `Email sent to ${emails.join(', ')} successfully` },
            { status: 200, headers: CORS_HEADERS }
        );
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
