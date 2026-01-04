import { repository } from '../db';
import { Room, Item, Participant, Assignment, RoomState } from '@snap-split/shared';
import { v4 as uuidv4 } from 'uuid';

const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export class RoomService {
    async createRoom(roomName: string, creatorName: string): Promise<Room> {
        const room: Room = {
            id: uuidv4(),
            code: generateRoomCode(),
            name: roomName,
            creator_name: creatorName,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        await repository.createRoom(room);

        // Add creator as participant
        await this.joinRoom(room.code, creatorName);

        return room;
    }

    async joinRoom(code: string, participantName: string): Promise<Participant | null> {
        const room = await repository.getRoom(code);
        if (!room) return null;

        // Check if name exists
        const participants = await repository.getParticipants(room.id);
        const existing = participants.find(p => p.name === participantName);
        if (existing) return existing;

        const participant: Participant = {
            id: uuidv4(),
            room_id: room.id,
            name: participantName,
            joined_at: new Date().toISOString()
        };

        return await repository.addParticipant(participant);
    }

    async getRoomState(code: string): Promise<RoomState | null> {
        return await repository.getRoomState(code);
    }

    async addItem(roomId: string, name: string, price: number, quantity: number): Promise<Item> {
        const item: Item = {
            id: uuidv4(),
            room_id: roomId,
            name,
            price,
            quantity,
            created_at: new Date().toISOString()
        };
        return await repository.addItem(item);
    }

    async removeItem(itemId: string): Promise<boolean> {
        return await repository.deleteItem(itemId);
    }

    async updateItem(itemId: string, updates: Partial<Item>): Promise<Item | null> {
        return await repository.updateItem(itemId, updates);
    }

    async assignItem(itemId: string, participantId: string): Promise<Assignment> {
        // Check existing assignments for item
        // For MVP simple logic: If already assigned to ONE user, adding another -> Split 50/50 etc.
        // Repo addAssignment just adds a row. Logic for "percentage" calculation should ideally be here or frontend.
        // For now, let's just add the row implementation with default 100
        // Then the calculator re-evaluates?
        // Wait, storage has 'percentage'. We need to maintain invariant sum = 100?
        // Or just store raw assignments and normalize on read?
        // Plan says "Fair Splitting - Click items to assign, auto-calculates".
        // Let's stick to simple Add.

        const assignment: Assignment = {
            id: uuidv4(),
            item_id: itemId,
            participant_id: participantId,
            percentage: 100 // Default, frontend can adjust or we adjust logic later
        };
        return await repository.addAssignment(assignment);
    }

    async removeAssignment(assignmentId: string): Promise<boolean> {
        return await repository.removeAssignment(assignmentId);
    }

    async deleteRoom(code: string): Promise<boolean> {
        return await repository.deleteRoom(code);
    }
}

export const roomService = new RoomService();
