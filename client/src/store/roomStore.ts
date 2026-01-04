import { create } from 'zustand';
import type { Room, Item, Participant, Assignment } from '@snap-split/shared';
import { calculateSplits, type SplitResult } from '../lib/splitCalculator';

interface RoomState {
    room: Room | null;
    items: Item[];
    participants: Participant[];
    assignments: Assignment[];
    currentUser: Participant | null;
    activeParticipantId: string | null;
    onlineParticipantIds: string[];

    // Actions
    setRoomData: (data: { room: Room; items: Item[]; participants: Participant[]; assignments: Assignment[] }) => void;
    addItem: (item: Item) => void;
    updateItem: (itemId: string, updates: Partial<Item>) => void;
    removeItem: (itemId: string) => void;
    addParticipant: (participant: Participant) => void;
    updateAssignment: (assignment: Assignment) => void;
    removeAssignment: (assignmentId: string) => void;
    setCurrentUser: (user: Participant) => void;
    updateRoom: (updates: Partial<Room>) => void;
    setActiveParticipantId: (id: string | null) => void;
    setOnlineParticipants: (ids: string[]) => void;

    // Computed
    splits: SplitResult[];
}

export const useRoomStore = create<RoomState>((set) => ({
    room: null,
    items: [],
    participants: [],
    assignments: [],
    currentUser: null,
    activeParticipantId: null,
    onlineParticipantIds: [],
    splits: [],

    setRoomData: (data) => {
        set({
            room: data.room,
            items: data.items,
            participants: data.participants,
            assignments: data.assignments,
            onlineParticipantIds: (data as any).onlineParticipantIds || [],
            // Recalculate splits
            splits: calculateSplits(data.items, data.assignments, data.participants, data.room.tax_rate, data.room.service_charge_rate)
        });
    },

    updateRoom: (updates) => {
        set((state) => {
            if (!state.room) return state;
            const updatedRoom = { ...state.room, ...updates };
            return {
                room: updatedRoom,
                splits: calculateSplits(state.items, state.assignments, state.participants, updatedRoom.tax_rate, updatedRoom.service_charge_rate)
            };
        });
    },

    addItem: (item) => {
        set((state) => {
            const newItems = [...state.items, item];
            return {
                items: newItems,
                splits: calculateSplits(newItems, state.assignments, state.participants, state.room?.tax_rate, state.room?.service_charge_rate)
            };
        });
    },

    updateItem: (itemId, updates) => {
        set((state) => {
            const newItems = state.items.map(i => i.id === itemId ? { ...i, ...updates } : i);
            return {
                items: newItems,
                splits: calculateSplits(newItems, state.assignments, state.participants, state.room?.tax_rate, state.room?.service_charge_rate)
            };
        });
    },

    removeItem: (itemId) => {
        set((state) => {
            const newItems = state.items.filter(i => i.id !== itemId);
            const newAssignments = state.assignments.filter(a => a.item_id !== itemId);
            return {
                items: newItems,
                assignments: newAssignments,
                splits: calculateSplits(newItems, newAssignments, state.participants, state.room?.tax_rate, state.room?.service_charge_rate)
            };
        });
    },

    addParticipant: (participant) => {
        set((state) => {
            if (state.participants.some(p => p.id === participant.id)) return state;
            const newParticipants = [...state.participants, participant];
            return {
                participants: newParticipants,
                splits: calculateSplits(state.items, state.assignments, newParticipants, state.room?.tax_rate, state.room?.service_charge_rate)
            };
        });
    },

    updateAssignment: (assignment) => {
        set((state) => {
            const otherAssignments = state.assignments.filter(a => a.id !== assignment.id);
            const newAssignments = [...otherAssignments, assignment];
            return {
                assignments: newAssignments,
                splits: calculateSplits(state.items, newAssignments, state.participants, state.room?.tax_rate, state.room?.service_charge_rate)
            };
        });
    },

    removeAssignment: (assignmentId) => {
        set((state) => {
            const newAssignments = state.assignments.filter(a => a.id !== assignmentId);
            return {
                assignments: newAssignments,
                splits: calculateSplits(state.items, newAssignments, state.participants, state.room?.tax_rate, state.room?.service_charge_rate)
            };
        });
    },

    setCurrentUser: (user) => set({ currentUser: user, activeParticipantId: user.id }),
    setActiveParticipantId: (id) => set({ activeParticipantId: id }),
    setOnlineParticipants: (ids) => set({ onlineParticipantIds: ids })
}));
