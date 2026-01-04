import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

const JoinRoom = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const nameInputRef = useRef<HTMLInputElement>(null);

    const urlCode = searchParams.get('code');
    const [roomCode, setRoomCode] = useState(urlCode || '');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (urlCode && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [urlCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeToUse = roomCode.trim().toUpperCase();
        if (!codeToUse || !userName.trim()) return;

        try {
            await api.joinRoom(codeToUse, userName);
            // Persist user identity
            localStorage.setItem(`snap-split-user-${codeToUse}`, userName);

            navigate(`/room/${codeToUse}`);
        } catch (error) {
            console.error(error);
            alert('Failed to join room. Check the code!');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                    {urlCode ? 'Ready to Join?' : 'Join Room'}
                </h2>
                {urlCode && (
                    <p className="text-gray-500 mb-6 font-medium">
                        Joining room <span className="text-primary-600 font-bold font-mono">{urlCode}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!urlCode && (
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
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input
                            ref={nameInputRef}
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Sarah"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            autoFocus={!urlCode}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all mt-6"
                    >
                        Join Room
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-gray-500 text-sm hover:text-gray-700 mt-4 font-medium"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinRoom;
