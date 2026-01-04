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
    const [participants, setParticipants] = useState<any[]>([]);
    const [onlineIds, setOnlineIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (urlCode && nameInputRef.current) {
            nameInputRef.current.focus();
        }
        if (roomCode.length === 6) {
            fetchParticipants(roomCode);
        }
    }, [urlCode, roomCode]);

    const fetchParticipants = async (code: string) => {
        try {
            setLoading(true);
            const data = await api.getRoomState(code);
            setParticipants(data.participants || []);
            setOnlineIds(data.onlineParticipantIds || []);
        } catch (e) {
            console.error("Failed to fetch participants", e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (name: string) => {
        const codeToUse = roomCode.trim().toUpperCase();
        if (!codeToUse || !name.trim()) return;

        // Check if name is online
        const onlineParticipant = participants.find(p => p.name === name && onlineIds.includes(p.id));
        if (onlineParticipant) {
            alert(`"${name}" is currently active in this room. If this is you, please close other tabs first.`);
            return;
        }

        try {
            await api.joinRoom(codeToUse, name);
            localStorage.setItem(`snap-split-user-${codeToUse}`, name);
            navigate(`/room/${codeToUse}`);
        } catch (error) {
            console.error(error);
            alert('Failed to join room. Check the code!');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleJoin(userName);
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

                    {loading && <div className="animate-pulse flex space-x-2 py-4"><div className="h-2 w-24 bg-gray-200 rounded"></div></div>}

                    {participants.length > 0 && (
                        <div className="space-y-3 pb-4 border-b border-gray-100 mb-6">
                            <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Claim your name</label>
                            <div className="flex flex-wrap gap-2">
                                {participants.map((p) => {
                                    const isOnline = onlineIds.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            disabled={isOnline}
                                            onClick={() => handleJoin(p.name)}
                                            className={`
                                                px-4 py-2 rounded-xl font-bold border transition-all flex items-center gap-2
                                                ${isOnline
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                                    : 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100'
                                                }
                                            `}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isOnline ? 'bg-gray-200' : 'bg-white'}`}>
                                                {p.name.charAt(0).toUpperCase()}
                                            </span>
                                            {p.name}
                                            {isOnline && <span className="text-[8px] font-black uppercase opacity-60">(Online)</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {participants.length > 0 ? 'Or join as someone else' : 'Your Name'}
                        </label>
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
