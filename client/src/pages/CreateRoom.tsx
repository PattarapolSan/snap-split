import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const CreateRoom = () => {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [userName, setUserName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim() || !userName.trim()) return;

        try {
            const room = await api.createRoom(roomName, userName);
            // Store current user usage 
            // Ideally we get participant object back or just name. 
            // The create endpoint returns Room object. 
            // We know we are the creator.
            // We should probably join strictly or assume implied presence.
            // But we better set user in store manually or re-fetch.
            // Let's just navigate. The Room page will fetch state.
            // We need to persist "Me" identity. 
            // Simple way: localStorage or pass via state.
            localStorage.setItem(`snap-split-user-${room.code}`, userName);

            navigate(`/room/${room.code}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create room');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Room</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Dinner at Sushi Bar"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. John"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all mt-6"
                    >
                        Create Room
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-gray-500 text-sm hover:text-gray-700 mt-4"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoom;
