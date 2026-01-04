import { create } from 'zustand';
import type { Room, Item, Participant, Assignment } from '@snap-split/shared';
import { calculateSplits, type SplitResult } from '../lib/splitCalculator';

interface RoomState {
    room: Room | null;
    items: Item[];
    participants: Participant[];
    assignments: Assignment[];
    currentUser: Participant | null;

    // Actions
    setRoomData: (data: { room: Room; items: Item[]; participants: Participant[]; assignments: Assignment[] }) => void;
    addItem: (item: Item) => void;
    updateItem: (itemId: string, updates: Partial<Item>) => void;
    removeItem: (itemId: string) => void;
    addParticipant: (participant: Participant) => void;
    updateAssignment: (assignment: Assignment) => void;
    removeAssignment: (assignmentId: string) => void;
    setCurrentUser: (user: Participant) => void;

    // Computed
    splits: SplitResult[];
}

export const useRoomStore = create<RoomState>((set) => ({
    room: null,
    items: [],
    participants: [],
    assignments: [],
    currentUser: null,
    splits: [],

    setRoomData: (data) => {
        set({
            room: data.room,
            items: data.items,
            participants: data.participants,
            assignments: data.assignments,
            // Recalculate splits
            splits: calculateSplits(data.items, data.assignments, data.participants)
        });
    },

    addItem: (item) => {
        set((state) => {
            const newItems = [...state.items, item];
            return {
                items: newItems,
                splits: calculateSplits(newItems, state.assignments, state.participants)
            };
        });
    },

    updateItem: (itemId, updates) => {
        set((state) => {
            const newItems = state.items.map(i => i.id === itemId ? { ...i, ...updates } : i);
            return {
                items: newItems,
                splits: calculateSplits(newItems, state.assignments, state.participants)
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
                splits: calculateSplits(newItems, newAssignments, state.participants)
            };
        });
    },

    addParticipant: (participant) => {
        set((state) => {
            const newParticipants = [...state.participants, participant];
            return {
                participants: newParticipants,
                splits: calculateSplits(state.items, state.assignments, newParticipants)
            };
        });
    },

    updateAssignment: (assignment) => {
        set((state) => {
            // Remove existing assignment for same item/participant if exists to avoid dupes?
            // Or simply add/update. Assuming simple append or replace logic.
            // For MVP, clearer to filter out old one if replacing entire assignment logic
            // But typically we assign by adding an entry.
            const otherAssignments = state.assignments.filter(a => a.id !== assignment.id);
            const newAssignments = [...otherAssignments, assignment];
            return {
                assignments: newAssignments,
                splits: calculateSplits(state.items, newAssignments, state.participants)
            };
        });
    },

    removeAssignment: (assignmentId) => {
        set((state) => {
            const newAssignments = state.assignments.filter(a => a.id !== assignmentId);
            return {
                assignments: newAssignments,
                splits: calculateSplits(state.items, newAssignments, state.participants)
            };
        });
    },

    setCurrentUser: (user) => set({ currentUser: user })
}));
