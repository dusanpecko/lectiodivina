import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// GET single user
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params
    const adminClient = createAdminClient()

    // Try custom users table first
    const { data, error } = await adminClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      return NextResponse.json({ user: data, source: 'users_table' })
    }

    // Fallback to auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(id)

    if (authError) {
      throw new Error(`User not found: ${authError.message}`)
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Map auth user to our format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = authUser.user as any
    const mappedUser = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.raw_user_meta_data?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || user.raw_user_meta_data?.avatar_url || null,
      provider: user.app_metadata?.provider || 'email',
      created_at: user.created_at,
      role: user.user_metadata?.role || user.raw_user_meta_data?.role || 'user'
    }

    return NextResponse.json({ user: mappedUser, source: 'auth_users' })

  } catch (error: unknown) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT/PATCH update user
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params
    const updates = await request.json()
    const adminClient = createAdminClient()

    // Update in custom users table
    const { data, error } = await adminClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      return NextResponse.json({ user: data, message: 'User updated successfully' })
    }

    // If custom users table doesn't work, update auth.users metadata
    const { data: authData, error: authError } = await adminClient.auth.admin.updateUserById(id, {
      user_metadata: {
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        role: updates.role
      }
    })

    if (authError) {
      throw new Error(`Failed to update user: ${authError.message}`)
    }

    return NextResponse.json({ 
      user: authData.user, 
      message: 'User updated successfully (auth metadata)' 
    })

  } catch (error: unknown) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params
    const adminClient = createAdminClient()

    console.log('🗑️ Deleting user:', id);

    // 1. Delete from auth.users first (this will cascade to related tables due to FK constraints)
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)

    if (authError) {
      console.error('❌ Auth delete error:', authError);
      throw new Error(`Failed to delete user from auth: ${authError.message}`)
    }

    console.log('✅ Deleted from auth.users');

    // 2. Delete from custom users table (if exists and not already cascaded)
    const { error: usersError } = await adminClient.from('users').delete().eq('id', id)
    
    if (usersError) {
      console.warn('⚠️ Custom users table delete error (might already be cascaded):', usersError);
      // Don't throw, as auth delete already succeeded
    } else {
      console.log('✅ Deleted from users table');
    }

    return NextResponse.json({ 
      message: 'User deleted successfully from both auth and users table',
      deleted_from: ['auth.users', 'users']
    })

  } catch (error: unknown) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}