import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { emailTemplate } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

// GET - Get single email template
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const template = await db.select()
            .from(emailTemplate)
            .where(eq(emailTemplate.id, params.id))
            .limit(1);

        if (template.length === 0) {
            return NextResponse.json(
                { message: 'Email template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ template: template[0] });
    } catch (error) {
        console.error('Error fetching email template:', error);
        return NextResponse.json(
            { message: 'Failed to fetch email template' },
            { status: 500 }
        );
    }
}

// PUT - Update email template
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, subject, content } = body;

        if (!name || !subject || !content) {
            return NextResponse.json(
                { message: 'Name, subject, and content are required' },
                { status: 400 }
            );
        }

        const updatedTemplate = await db.update(emailTemplate)
            .set({
                name,
                subject,
                content,
                updatedAt: new Date(),
            })
            .where(eq(emailTemplate.id, params.id))
            .returning();

        if (updatedTemplate.length === 0) {
            return NextResponse.json(
                { message: 'Email template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Email template updated successfully',
            template: updatedTemplate[0]
        });
    } catch (error) {
        console.error('Error updating email template:', error);
        return NextResponse.json(
            { message: 'Failed to update email template' },
            { status: 500 }
        );
    }
}

// DELETE - Delete email template
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deletedTemplate = await db.delete(emailTemplate)
            .where(eq(emailTemplate.id, params.id))
            .returning();

        if (deletedTemplate.length === 0) {
            return NextResponse.json(
                { message: 'Email template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Email template deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting email template:', error);
        return NextResponse.json(
            { message: 'Failed to delete email template' },
            { status: 500 }
        );
    }
} 