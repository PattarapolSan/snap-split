import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const JoinRoom = () => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [userName, setUserName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode.trim() || !userName.trim()) return;

        try {
            await api.joinRoom(roomCode, userName);
            // Persist user identity
            localStorage.setItem(`snap-split-user-${roomCode}`, userName);

            navigate(`/room/${roomCode}`);
        } catch (error) {
            console.error(error);
            alert('Failed to join room. Check the code!');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Join Room</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Code</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase tracking-widest"
                            placeholder="ABC123"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Sarah"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all mt-6"
                    >
                        Join Room
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

export default JoinRoom;
