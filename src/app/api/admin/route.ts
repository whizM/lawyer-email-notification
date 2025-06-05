import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { admins } from '@/db/schema';
import * as bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {

  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    // Handle missing token
    return NextResponse.json(
      { message: 'No token provided' },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  try {
    const { payload } = await jwtVerify(token, secret);
    // payload contains user info (e.g., payload.user_id, payload.username, payload.email)
    console.log('User info:', payload);
    return NextResponse.json(
      { message: 'Admin user found', admin: payload },
      { status: 200 }
    );
  } catch (error) {
    // Token is invalid or expired
    console.error('Invalid token', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const admin = await db.query.admins.findFirst();

    if (!admin) {
      return NextResponse.json(
        { message: 'There is no admin user' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password || '');

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid current password' },
        { status: 401 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.update(admins).set({ password: hashedNewPassword }).where(eq(admins.id, admin.id));

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
