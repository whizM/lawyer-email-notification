import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { admins, laywers } from './schema';
import * as bcrypt from 'bcryptjs';
import csv from 'csvtojson';
import path from 'path'; 

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

    const filePath = path.join(process.cwd(), 'public', 'NameEmail.csv');
    const jsonArray = await csv().fromFile(filePath);
    
    const laywerRecords = jsonArray.map((item) => ({
        name: item.Name,
        email: item.Contact,
    }));

    await db.insert(laywers).values(laywerRecords);

    console.log('New laywers created!')
}

main();
