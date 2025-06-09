import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lawyers } from "@/db/schema";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Check if file is CSV
        if (!file.name.endsWith('.csv')) {
            return NextResponse.json({ error: "Please upload a CSV file" }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json({ error: "CSV file must have at least a header and one data row" }, { status: 400 });
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Expected columns: Attorney, Phone, Email
        const attorneyIndex = header.findIndex(h => h.includes('attorney') || h.includes('name'));
        const phoneIndex = header.findIndex(h => h.includes('phone'));
        const emailIndex = header.findIndex(h => h.includes('email'));
        const cityIndex = header.findIndex(h => h.includes('city'));
        const stateIndex = header.findIndex(h => h.includes('state'));
        const zipIndex = header.findIndex(h => h.includes('zip'));
        const addressIndex = header.findIndex(h => h.includes('address'));
        const longitudeIndex = header.findIndex(h => h.includes('geocodio longitude'));
        const latitudeIndex = header.findIndex(h => h.includes('geocodio latitude'));

        if (attorneyIndex === -1 || emailIndex === -1) {
            return NextResponse.json({
                error: "CSV must contain 'Attorney' (or 'Name') and 'Email' columns"
            }, { status: 400 });
        }

        // Parse data rows
        const dataRows = lines.slice(1);
        const lawyersToInsert = [];
        const errors = [];
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i].split(',').map(cell => cell.trim().replace(/"/g, ''));

            if (row.length < Math.max(attorneyIndex, emailIndex) + 1) {
                errors.push(`Row ${i + 2}: Insufficient columns`);
                continue;
            }

            const name = row[attorneyIndex];
            const email = row[emailIndex];
            const phone = phoneIndex !== -1 ? row[phoneIndex] : '';
            const city = cityIndex !== -1 ? row[cityIndex] : '';
            const state = stateIndex !== -1 ? row[stateIndex] : '';
            const zip = zipIndex !== -1 ? row[zipIndex] : '';
            const address = addressIndex !== -1 ? row[addressIndex] : '';
            const longitude = longitudeIndex !== -1 ? row[longitudeIndex] : '';
            const latitude = latitudeIndex !== -1 ? row[latitudeIndex] : '';
            if (!name || !email) {
                errors.push(`Row ${i + 2}: Missing name or email`);
                continue;
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push(`Row ${i + 2}: Invalid email format`);
                continue;
            }

            lawyersToInsert.push({
                name: name,
                email: email,
                phone: phone || null,
                city: city || null,
                state: state || null,
                zip: zip || null,
                address: address || null,
                longitude: longitude || null,
                latitude: latitude || null
            });
        }
        console.log(errors);
        console.log(lawyersToInsert);
        if (lawyersToInsert.length === 0) {
            return NextResponse.json({
                error: "No valid lawyers to insert",
                details: errors
            }, { status: 400 });
        }

        // Insert lawyers into database
        try {
            await db.insert(lawyers).values(lawyersToInsert);

            return NextResponse.json({
                success: true,
                message: `Successfully imported ${lawyersToInsert.length} lawyers`,
                imported: lawyersToInsert.length,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (dbError) {
            return NextResponse.json({
                error: "Database error while inserting lawyers",
                details: String(dbError)
            }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({
            error: "Failed to process CSV file",
            details: String(error)
        }, { status: 500 });
    }
}
