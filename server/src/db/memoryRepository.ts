import { Repository } from './repository';
import { Room, Item, Participant, Assignment, RoomState } from '@snap-split/shared';

// In-memory mock database
export class MemoryRepository implements Repository {
    private rooms = new Map<string, Room>();
    private items = new Map<string, Item>();
    private participants = new Map<string, Participant>();
    private assignments = new Map<string, Assignment>();

    async createRoom(room: Room): Promise<Room> {
        this.rooms.set(room.id, room);
        return room;
    }

    async getRoom(code: string): Promise<Room | null> {
        const room = Array.from(this.rooms.values()).find(r => r.code === code);
        return room || null;
    }

    async addParticipant(participant: Participant): Promise<Participant> {
        this.participants.set(participant.id, participant);
        return participant;
    }

    async getParticipants(roomId: string): Promise<Participant[]> {
        return Array.from(this.participants.values()).filter(p => p.room_id === roomId);
    }

    async addItem(item: Item): Promise<Item> {
        this.items.set(item.id, item);
        return item;
    }

    async getItems(roomId: string): Promise<Item[]> {
        return Array.from(this.items.values()).filter(i => i.room_id === roomId);
    }

    async updateItem(itemId: string, updates: Partial<Item>): Promise<Item | null> {
        const item = this.items.get(itemId);
        if (!item) return null;
        const updated = { ...item, ...updates };
        this.items.set(itemId, updated);
        return updated;
    }

    async deleteItem(itemId: string): Promise<boolean> {
        // Cascade delete assignments
        const assignmentsToDelete = Array.from(this.assignments.values())
            .filter(a => a.item_id === itemId);
        assignmentsToDelete.forEach(a => this.assignments.delete(a.id));

        return this.items.delete(itemId);
    }

    async addAssignment(assignment: Assignment): Promise<Assignment> {
        this.assignments.set(assignment.id, assignment);
        return assignment;
    }

    async getAssignments(roomId: string): Promise<Assignment[]> {
        // Need to find items in room first, then assignments for those items
        const roomItems = await this.getItems(roomId);
        const itemIds = new Set(roomItems.map(i => i.id));

        return Array.from(this.assignments.values()).filter(a => itemIds.has(a.item_id));
    }

    async removeAssignment(assignmentId: string): Promise<boolean> {
        return this.assignments.delete(assignmentId);
    }

    async getRoomState(code: string): Promise<RoomState | null> {
        const room = await this.getRoom(code);
        if (!room) return null;

        const items = await this.getItems(room.id);
        const participants = await this.getParticipants(room.id);
        const assignments = await this.getAssignments(room.id);

        return {
            room,
            items,
            participants,
            assignments
        };
    }

    async deleteRoom(code: string): Promise<boolean> {
        return this.rooms.delete(code);
    }
}
