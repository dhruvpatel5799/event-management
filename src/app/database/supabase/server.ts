import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

export async function createClient() {
  const cookieStore = await cookies()
  const { userId } = await auth()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: {
          ...(userId ? { "x-clerk-user-id": userId } : {})
        },
      },
    }
  )
}

// Admin client with service role key (bypasses RLS)
export async function createAdminClient() {
  const cookieStore = await cookies()
  const { userId } = await auth()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← Service role key
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: {
          // Include Clerk user ID for audit trails, even in admin operations
          ...(userId ? { "x-clerk-user-id": userId } : {}),
          // You could add additional admin-specific headers here
          "x-client-type": "admin"
        },
      },
    }
  )
}