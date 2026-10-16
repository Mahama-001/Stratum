import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession, hashPassword } from '@/lib/auth';
import { getAllUsers, createUser, updateUser, deleteUser, logAuditEvent, findUserById, findUserByEmail } from '@/lib/db';

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const role = searchParams.get('role') || undefined;
  const status = searchParams.get('status') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const result = getAllUsers({ search, role, status, limit, offset });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, name, password, role, status } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = createUser({
      email,
      name,
      passwordHash,
      role: role || 'trader',
      status: status || 'active',
    });

    logAuditEvent('USER_CREATED_BY_ADMIN', 'admin', `Created user: ${newUser.email} (${newUser.role})`);

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, role, status, newPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = findUserById(id);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let passwordHash: string | undefined = undefined;
    if (newPassword) {
      passwordHash = await hashPassword(newPassword);
    }

    const updated = updateUser(id, {
      name,
      role,
      status,
      passwordHash,
    });

    logAuditEvent('USER_UPDATED_BY_ADMIN', 'admin', `Updated user: ${existing.email} (Role: ${role || existing.role}, Status: ${status || existing.status})`);

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = findUserById(id);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deleted = deleteUser(id);
    if (deleted) {
      logAuditEvent('USER_DELETED_BY_ADMIN', 'admin', `Deleted user ${existing.email} (ID: ${id})`);
      return NextResponse.json({ success: true, message: `User ${existing.email} deleted successfully` });
    } else {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete user' }, { status: 500 });
  }
}
