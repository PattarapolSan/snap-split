export interface Room {
    id: string;
    code: string;
    name: string;
    creator_name: string;
    created_at: string;
    expires_at: string;
    status: 'active' | 'completed';
}

export interface Item {
    id: string;
    room_id: string;
    name: string;
    price: number;
    quantity: number;
    created_at?: string;
}

export interface Participant {
    id: string;
    room_id: string;
    name: string;
    joined_at?: string;
    // Computed fields
    total_owed?: number;
    paid?: boolean;
}

export interface Assignment {
    id: string;
    item_id: string;
    participant_id: string;
    percentage: number; // 0 to 100
}

export interface RoomState {
    room: Room;
    items: Item[];
    participants: Participant[];
    assignments: Assignment[];
}
