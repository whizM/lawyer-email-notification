import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { emailTemplate } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

// GET - List all email templates
export async function GET() {
    try {
        const templates = await db.select().from(emailTemplate);
        return NextResponse.json({ templates });
    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json(
            { message: 'Failed to fetch email templates' },
            { status: 500 }
        );
    }
}

// POST - Create new email template
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, subject, content } = body;

        if (!name || !subject || !content) {
            return NextResponse.json(
                { message: 'Name, subject, and content are required' },
                { status: 400 }
            );
        }

        const newTemplate = await db.insert(emailTemplate).values({
            name,
            subject,
            content,
        }).returning();

        return NextResponse.json({
            message: 'Email template created successfully',
            template: newTemplate[0]
        });
    } catch (error) {
        console.error('Error creating email template:', error);
        return NextResponse.json(
            { message: 'Failed to create email template' },
            { status: 500 }
        );
    }
} 