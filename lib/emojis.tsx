import { 
  ThumbsUp, Heart, Smile, Meh, Frown, Annoyed, 
  PartyPopper, Flame, Hand, Sparkles, CheckCircle2, 
  HelpCircle, Skull, Eye, Zap, Dumbbell, LucideProps
} from 'lucide-react'

export const EMOJI_MAP: Record<string, React.FC<LucideProps>> = {
  '👍': ThumbsUp,
  '❤️': Heart,
  '😂': Smile,
  '😮': Meh,
  '😢': Frown,
  '😡': Annoyed,
  '🎉': PartyPopper,
  '🔥': Flame,
  '👏': Hand,
  '✨': Sparkles,
  '💯': CheckCircle2,
  '🤔': HelpCircle,
  '😍': Heart, // Duplicate but okay
  '🙏': Hand, // Close enough for minimalist Lucide
  '💀': Skull,
  '👀': Eye,
  '⚡': Zap,
  '💪': Dumbbell,
}

export function EmojiSvg({ emoji, size = 18, ...props }: { emoji: string, size?: number } & LucideProps) {
  const Icon = EMOJI_MAP[emoji]
  if (!Icon) return <span style={{ fontSize: size }}>{emoji}</span>
  
  return <Icon size={size} {...props} />
}

export const REACTION_LIST = Object.keys(EMOJI_MAP)
