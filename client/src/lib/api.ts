const isDev = import.meta.env.DEV;
const API_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3001/api' : '/api');

export const api = {
    createRoom: async (roomName: string, creatorName: string) => {
        const res = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName, creatorName }),
        });
        if (!res.ok) throw new Error('Failed to create room');
        return res.json();
    },

    joinRoom: async (code: string, name: string) => {
        const res = await fetch(`${API_URL}/rooms/${code}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to join room');
        return res.json();
    },

    getRoomState: async (code: string) => {
        const res = await fetch(`${API_URL}/rooms/${code}`);
        if (!res.ok) throw new Error('Failed to get room state');
        return res.json();
    },

    addItem: async (code: string, roomId: string, name: string, price: number, quantity: number) => {
        const res = await fetch(`${API_URL}/rooms/${code}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, quantity, roomId }),
        });
        if (!res.ok) throw new Error('Failed to add item');
        return res.json();
    },

    assignItem: async (code: string, itemId: string, participantId: string) => {
        const res = await fetch(`${API_URL}/rooms/${code}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, participantId }),
        });
        if (!res.ok) throw new Error('Failed to assign item');
        return res.json();
    },

    updateItem: async (code: string, itemId: string, name: string, price: number, quantity: number) => {
        const res = await fetch(`${API_URL}/rooms/${code}/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, quantity }),
        });
        if (!res.ok) throw new Error('Failed to update item');
        return res.json();
    },

    removeItem: async (code: string, itemId: string) => {
        const res = await fetch(`${API_URL}/rooms/${code}/items/${itemId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to remove item');
        return res.json();
    },

    analysisReceipt: async (code: string, imageFile: File) => {
        const formData = new FormData();
        formData.append('receipt', imageFile);

        const res = await fetch(`${API_URL}/rooms/${code}/analyze`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to analyze receipt');
        return res.json();
    },

    removeAssignment: async (code: string, assignmentId: string) => {
        const res = await fetch(`${API_URL}/rooms/${code}/assignments/${assignmentId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to remove assignment');
        return res.json();
    },

    deleteRoom: async (code: string) => {
        const res = await fetch(`${API_URL}/rooms/${code}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete room');
        return res.json();
    },

    updateRoom: async (code: string, updates: any) => {
        const res = await fetch(`${API_URL}/rooms/${code}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update room');
        return res.json();
    }
};
