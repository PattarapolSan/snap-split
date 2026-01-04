export interface RecentRoom {
    code: string;
    name: string;
    lastVisited: number;
    userName?: string;
}

const STORAGE_KEY = 'snap-split-history';

export const storage = {
    getRecentRooms: (): RecentRoom[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data).sort((a: RecentRoom, b: RecentRoom) => b.lastVisited - a.lastVisited);
        } catch (e) {
            return [];
        }
    },

    saveRoomVisit: (code: string, name: string, userName?: string) => {
        const rooms = storage.getRecentRooms();
        const existingIndex = rooms.findIndex(r => r.code === code);

        const updatedRoom: RecentRoom = {
            code,
            name,
            lastVisited: Date.now(),
            userName: userName || rooms[existingIndex]?.userName
        };

        if (existingIndex > -1) {
            rooms[existingIndex] = updatedRoom;
        } else {
            rooms.push(updatedRoom);
        }

        // Keep only last 10 rooms
        const limited = rooms
            .sort((a, b) => b.lastVisited - a.lastVisited)
            .slice(0, 10);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    },

    removeRoom: (code: string) => {
        const rooms = storage.getRecentRooms().filter(r => r.code !== code);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    }
};
