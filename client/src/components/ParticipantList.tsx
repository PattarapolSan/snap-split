import React, { useState, useRef, useEffect } from 'react';
import type { Participant } from '@snap-split/shared';
import type { SplitResult } from '../lib/splitCalculator';
import { formatBaht } from '../lib/splitCalculator';

interface ParticipantListProps {
    participants: Participant[];
    splits: SplitResult[];
    currentUserId?: string;
    activeId?: string | null;
    onlineParticipantIds: string[];
    onSelectParticipant: (id: string) => void;
    onAddParticipant: (name: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
    participants, splits, currentUserId, activeId, onlineParticipantIds, onSelectParticipant, onAddParticipant
}) => {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adding) inputRef.current?.focus();
    }, [adding]);

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onAddParticipant(trimmed);
        setName('');
        setAdding(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') { setAdding(false); setName(''); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Participants</h3>
                <button
                    onClick={() => setAdding(a => !a)}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                >
                    + Add
                </button>
            </div>

            {adding && (
                <div className="p-3 border-b border-gray-100 bg-primary-50/40 flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter name..."
                        className="flex-1 bg-white border-2 border-primary-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:border-primary-500 transition-all"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="bg-primary-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40 transition-all active:scale-95"
                    >
                        Add
                    </button>
                    <button
                        onClick={() => { setAdding(false); setName(''); }}
                        className="text-gray-400 text-sm font-bold px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="divide-y divide-gray-100">
                {participants.map((participant) => {
                    const split = splits.find(s => s.participantId === participant.id);
                    const totalOwed = split ? split.totalOwed : 0;
                    const isMe = participant.id === currentUserId;
                    const isActive = participant.id === activeId;
                    const isOnline = onlineParticipantIds.includes(participant.id);

                    return (
                        <div
                            key={participant.id}
                            onClick={() => onSelectParticipant(participant.id)}
                            className={`
                                p-4 flex justify-between items-center transition-colors cursor-pointer
                                ${isActive ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : 'hover:bg-gray-50 active:bg-gray-100'}
                            `}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0
                                        ${isMe ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                        {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    {isOnline && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {participant.name}
                                        {isMe && <span className="ml-2 text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">You</span>}
                                    </p>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        {split?.items.length || 0} items assigned
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-gray-900 text-lg leading-none">฿{formatBaht(totalOwed)}</p>
                                <div className="mt-1">
                                    {participant.paid ? (
                                        <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-100">Paid</span>
                                    ) : (
                                        <span className="text-[10px] text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">Unpaid</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ParticipantList;
