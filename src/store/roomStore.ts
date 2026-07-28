import { create } from 'zustand'
import type { Participant, RoomSnapshot } from '@/types/canvas'

interface RoomState {
  roomId: string | null
  roomName: string
  inviteLink: string | null
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error'
  errorMessage: string | null
  revision: number
  participants: Participant[]
  roomSnapshot: RoomSnapshot | null
  setRoomId: (roomId: string | null) => void
  setRoomName: (roomName: string) => void
  setInviteLink: (inviteLink: string | null) => void
  setConnectionStatus: (status: RoomState['connectionStatus']) => void
  setErrorMessage: (errorMessage: string | null) => void
  setRevision: (revision: number) => void
  setParticipants: (participants: Participant[]) => void
  setRoomSnapshot: (snapshot: RoomSnapshot | null) => void
  resetRoom: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  roomName: 'Untitled room',
  inviteLink: null,
  connectionStatus: 'idle',
  errorMessage: null,
  revision: 0,
  participants: [],
  roomSnapshot: null,

  setRoomId: (roomId) => set({ roomId }),
  setRoomName: (roomName) => set({ roomName }),
  setInviteLink: (inviteLink) => set({ inviteLink }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setRevision: (revision) => set({ revision }),
  setParticipants: (participants) => set({ participants }),
  setRoomSnapshot: (roomSnapshot) => set({ roomSnapshot }),
  resetRoom: () => set({
    roomId: null,
    roomName: 'Untitled room',
    inviteLink: null,
    connectionStatus: 'idle',
    errorMessage: null,
    revision: 0,
    participants: [],
    roomSnapshot: null,
  }),
}))