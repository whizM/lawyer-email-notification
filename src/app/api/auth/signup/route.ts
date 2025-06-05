import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '@/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        // Validate inputs
        if (!email || !password || !name) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Find the admin user
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (user) {
            return NextResponse.json(
                { message: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
        }).returning();

        if (!newUser) {
            return NextResponse.json(
                { message: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Create JWT token
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        );

        const token = await new SignJWT({
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].name,
            role: 'user'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(secret);

        // Set the cookie
        const response = NextResponse.json(
            { message: 'Sign up successful', user: { id: newUser[0].id, email: newUser[0].email, name: newUser[0].name, role: 'user' } },
            { status: 200 }
        );

        response.cookies.set({
            name: 'auth-token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'development',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (error) {
        console.error('Sign Up error:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}