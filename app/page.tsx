import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/Topbar'
import { ChatRoom } from '@/components/ChatRoom'
import type { Message, UserProfile } from '@/lib/supabase/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'e-Tafatafa',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Upsert user profile
  const { data: userProfile } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        username:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split('@')[0] ??
          null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  const profile: UserProfile = userProfile ?? {
    id: user.id,
    email: user.email ?? null,
    username: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    created_at: new Date().toISOString(),
  }

  // Load last 100 messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*, users(*), reactions(*)')
    .order('created_at', { ascending: true })
    .limit(100)

  const safeMessages: Message[] = (messages ?? []).map((m) => ({
    ...m,
    users: m.users ?? null,
    reactions: m.reactions ?? [],
  }))

  return (
    <>

      <div className="flex-column h-full w-full" style={{ overflow: 'hidden' }}>
        <Topbar user={profile} />
        <main className="container-responsive flex-1 flex-column" style={{ minHeight: 0 }}>
          <div className="glass-panel chat-container animate-slide-up">
            <ChatRoom initialMessages={safeMessages} currentUserId={user.id} userProfile={profile} />
          </div>
        </main>
      </div>
    </>
  )
}
