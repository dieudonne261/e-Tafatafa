'use client'

import { createClient } from '@/lib/supabase/client'
import { MessageInput } from './MessageInput'
import type { UserProfile, Message } from '@/lib/supabase/types'

interface ChatInputWrapperProps {
  user: UserProfile
  replyTo: Message | null
  clearReply: () => void
}

export function ChatInputWrapper({ user, replyTo, clearReply }: ChatInputWrapperProps) {
  const supabase = createClient()

  async function handleSendMedia(file: File, bucket: string) {
    const ext = file.name.split('.').pop() || 'tmp'
    const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      alert("Échec de l'envoi du fichier.")
      throw error
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)
      
    return urlData.publicUrl
  }

  async function handleSendMessage({ text, image, file, gifUrl }: { text: string; image?: File; file?: File; gifUrl?: string }) {
    try {
      const payload: any = { user_id: user.id }
      if (text.trim()) payload.content = text.trim()
      if (replyTo) payload.reply_to_id = replyTo.id
      if (gifUrl) payload.gif_url = gifUrl
      
      if (image) {
        const url = await handleSendMedia(image, 'media-uploads')
        payload.image_url = url
      }
      
      if (file) {
        const url = await handleSendMedia(file, 'media-uploads')
        payload.file_url = url
        payload.file_name = file.name
      }
      
      // Prevent sending completely empty messages
      if (!payload.content && !payload.image_url && !payload.file_url && !payload.gif_url) {
        return
      }

      await supabase.from('messages').insert(payload)
      if (replyTo) clearReply()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSendAudio(blob: Blob, mimeType: string) {
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('voice-messages')
      .upload(fileName, blob, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      alert("Échec de l'envoi du message vocal.")
      return
    }

    const { data: urlData } = supabase.storage
      .from('voice-messages')
      .getPublicUrl(data.path)

    const payload: any = { user_id: user.id, audio_url: urlData.publicUrl }
    if (replyTo) payload.reply_to_id = replyTo.id
    await supabase.from('messages').insert(payload)
    if (replyTo) clearReply()
  }

  return (
    <MessageInput
      onSendMessage={handleSendMessage}
      onSendAudio={handleSendAudio}
    />
  )
}
