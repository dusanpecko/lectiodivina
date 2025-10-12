import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const globalSearch = searchParams.get('globalSearch') || ''
    const email = searchParams.get('email') || ''
    const fullName = searchParams.get('fullName') || ''
    const role = searchParams.get('role') || ''
    const provider = searchParams.get('provider') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const adminClient = createAdminClient()

    // Try custom users table first
    let dataQuery = adminClient.from("users").select("*")
    let countQuery = adminClient.from("users").select("*", { count: "exact", head: true })

    // Apply filters
    if (globalSearch) {
      const val = `%${globalSearch}%`
      dataQuery = dataQuery.or(
        `email.ilike.${val},full_name.ilike.${val},role.ilike.${val},provider.ilike.${val}`
      )
      countQuery = countQuery.or(
        `email.ilike.${val},full_name.ilike.${val},role.ilike.${val},provider.ilike.${val}`
      )
    } else {
      if (email) dataQuery = dataQuery.ilike("email", `%${email}%`)
      if (fullName) dataQuery = dataQuery.ilike("full_name", `%${fullName}%`)
      if (role) dataQuery = dataQuery.eq("role", role)
      if (provider) dataQuery = dataQuery.eq("provider", provider)
      if (dateFrom) {
        dataQuery = dataQuery.gte("created_at", dateFrom)
        countQuery = countQuery.gte("created_at", dateFrom)
      }
      if (dateTo) {
        dataQuery = dataQuery.lte("created_at", dateTo)
        countQuery = countQuery.lte("created_at", dateTo)
      }
    }

    dataQuery = dataQuery
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error } = await dataQuery
    const { count, error: countError } = await countQuery

    if (!error && !countError && data && data.length > 0) {
      return NextResponse.json({
        users: data,
        total: count || 0,
        source: 'users_table'
      })
    }

    // Fallback to auth.users if custom users table is empty or has errors
    console.log('Falling back to auth.users table...')
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers()

    if (authError) {
      throw new Error(`Auth users fetch failed: ${authError.message}`)
    }

    if (!authUsers?.users) {
      return NextResponse.json({ users: [], total: 0, source: 'auth_users' })
    }

    // Map auth users to our format
    interface AuthUser {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
      raw_user_meta_data?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
      created_at: string;
    }

    let mappedUsers = authUsers.users.map((user: AuthUser) => ({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.raw_user_meta_data?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || user.raw_user_meta_data?.avatar_url || null,
      provider: user.app_metadata?.provider || 'email',
      created_at: user.created_at,
      role: user.user_metadata?.role || user.raw_user_meta_data?.role || 'user'
    }))

    // Apply client-side filtering for auth users
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase()
      mappedUsers = mappedUsers.filter((user: any) => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        user.provider?.toLowerCase().includes(searchLower)
      )
    } else {
      if (email) mappedUsers = mappedUsers.filter((u: any) => u.email?.toLowerCase().includes(email.toLowerCase()))
      if (fullName) mappedUsers = mappedUsers.filter((u: any) => u.full_name?.toLowerCase().includes(fullName.toLowerCase()))
      if (role) mappedUsers = mappedUsers.filter((u: any) => u.role === role)
      if (provider) mappedUsers = mappedUsers.filter((u: any) => u.provider === provider)
      if (dateFrom) mappedUsers = mappedUsers.filter((u: any) => new Date(u.created_at) >= new Date(dateFrom))
      if (dateTo) mappedUsers = mappedUsers.filter((u: any) => new Date(u.created_at) <= new Date(dateTo))
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Apply pagination
    const total = mappedUsers.length
    const startIndex = (page - 1) * pageSize
    const paginatedUsers = mappedUsers.slice(startIndex, startIndex + pageSize)

    return NextResponse.json({
      users: paginatedUsers,
      total,
      source: 'auth_users'
    })

  } catch (error: unknown) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}