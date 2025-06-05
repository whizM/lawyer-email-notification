import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { admins } from './schema';
import * as bcrypt from 'bcryptjs';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const user: typeof admins.$inferInsert = {
        name: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
    };

    await db.insert(admins).values(user);
    console.log('New admin created!')
}

main();
