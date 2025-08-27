export interface User {
  id: string
  displayName: string
  username: string
  passwordHash: string
  inviteCode: string | null
  pairedWith: string | null
  createdAt: Date
}

export interface Pair {
  id: string
  userAId: string
  userBId: string
  delaySeconds: number
  turnUserId: string
  lastSentAt: Date | null
  createdAt: Date
  userA?: User
  userB?: User
  letters?: Letter[]
}

export interface Letter {
  id: string
  pairId: string
  authorId: string
  bodyText: string
  isFavorite: boolean
  isDraft: boolean
  sentAt: Date | null
  createdAt: Date
  updatedAt: Date
  author?: User
  pair?: Pair
}

export interface AuthUser {
  id: string
  username: string
  displayName: string
  pairedWith: string | null
  inviteCode?: string | null
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TimerInfo {
  canSend: boolean
  timeRemaining: number
  nextAvailableAt: Date | null
}

export interface PairInfo {
  pair: Pair | null
  partner: User | null
  isYourTurn: boolean
  timer: TimerInfo
}
