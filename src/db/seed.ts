import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { admins, emailTemplate } from './schema';
import * as bcrypt from 'bcryptjs';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const user: typeof admins.$inferInsert = {
        name: 'Randy Kelton',
        email: 'randy@randykelton.com',
        password: hashedPassword,
    };

    await db.insert(admins).values(user);
    console.log('New admin created!')


    const template: typeof emailTemplate.$inferInsert = {
        name: 'Report Notification',
        subject: 'New Report Submission',
        content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Report Submission</h2>
            <p><strong>User Email:</strong> {{email}}</p>
            <p><strong>Submission Time:</strong> {{timestamp}}</p>
            <p><strong>Report ID:</strong> {{reportId}}</p>
            <div style="margin: 20px 0;">
                {{formattedContent}}
            </div>
            <p style="margin-top: 20px; color: #7f8c8d;">
                This is an automated notification from our system.
            </p>
        </div>
        `
    };

    await db.insert(emailTemplate).values(template);
    console.log('Email template created!');
}

main();
