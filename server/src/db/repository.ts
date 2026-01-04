import { Room, Item, Participant, Assignment, RoomState } from '@snap-split/shared';

export interface Repository {
    createRoom(room: Room): Promise<Room>;
    getRoom(code: string): Promise<Room | null>;
    updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null>;
    addParticipant(participant: Participant): Promise<Participant>;
    getParticipants(roomId: string): Promise<Participant[]>;
    addItem(item: Item): Promise<Item>;
    getItems(roomId: string): Promise<Item[]>;
    updateItem(itemId: string, updates: Partial<Item>): Promise<Item | null>;
    deleteItem(itemId: string): Promise<boolean>;
    addAssignment(assignment: Assignment): Promise<Assignment>;
    getAssignments(roomId: string): Promise<Assignment[]>;
    removeAssignment(assignmentId: string): Promise<boolean>;

    // Composite fetch
    getRoomState(code: string): Promise<RoomState | null>;
    deleteRoom(code: string): Promise<boolean>;
    cleanupExpiredRooms(): Promise<number>;
}
