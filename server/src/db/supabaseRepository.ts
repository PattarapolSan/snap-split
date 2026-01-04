import { Repository } from './repository';
import { supabase } from './supabase';
import { Room, Item, Participant, Assignment, RoomState } from '@snap-split/shared';

export class SupabaseRepository implements Repository {
    async createRoom(room: Room): Promise<Room> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('rooms')
            .insert(room)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getRoom(code: string): Promise<Room | null> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) return null;
        return data;
    }

    async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('rooms')
            .update(updates)
            .eq('id', roomId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async addParticipant(participant: Participant): Promise<Participant> {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Omit computed fields if accidentally passed
        const { total_owed, paid, ...insertData } = participant;

        const { data, error } = await supabase
            .from('participants')
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getParticipants(roomId: string): Promise<Participant[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .eq('room_id', roomId);

        if (error) throw error;
        return data || [];
    }

    async addItem(item: Item): Promise<Item> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('items')
            .insert(item)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getItems(roomId: string): Promise<Item[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true }); // Ensure stable order

        if (error) throw error;
        return data || [];
    }

    async updateItem(itemId: string, updates: Partial<Item>): Promise<Item | null> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteItem(itemId: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Delete item error:', error);
            return false;
        }
        return true;
    }

    async addAssignment(assignment: Assignment): Promise<Assignment> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('assignments')
            .insert(assignment)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAssignments(roomId: string): Promise<Assignment[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Supabase doesn't support complex joins in simple query builder nicely for this specific nesting without type casting hell usually.
        // But we can filter by room_id via items join!
        // Or simpler: fetch items for room, then assignments. 
        // Or better: The interface asks for getAssignments(roomId).
        // Let's do a join query: select assignments where item.room_id = roomId

        const { data, error } = await supabase
            .from('assignments')
            .select(`
                *,
                items!inner(room_id)
            `)
            .eq('items.room_id', roomId);

        if (error) throw error;

        // Transform result to match Assignment interface (removing the joined items data)
        return (data || []).map((a: any) => ({
            id: a.id,
            item_id: a.item_id,
            participant_id: a.participant_id,
            percentage: a.percentage
        }));
    }

    async removeAssignment(assignmentId: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', assignmentId);

        if (error) return false;
        return true;
    }

    async getRoomState(code: string): Promise<RoomState | null> {
        // We could do a massive single query or parallel requests.
        // Parallel requests are cleaner for now.
        const room = await this.getRoom(code);
        if (!room) return null;

        const [items, participants, assignments] = await Promise.all([
            this.getItems(room.id),
            this.getParticipants(room.id),
            this.getAssignments(room.id)
        ]);

        return {
            room,
            items,
            participants,
            assignments
        };
    }

    async deleteRoom(code: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('code', code);

        return !error;
    }

    async cleanupExpiredRooms(): Promise<number> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('rooms')
            .delete()
            .lt('expires_at', new Date().toISOString())
            .select();

        if (error) {
            console.error('Cleanup error:', error);
            return 0;
        }
        return data?.length || 0;
    }
}
