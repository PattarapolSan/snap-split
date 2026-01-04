import React from 'react';
import type { Participant } from '@snap-split/shared';
import type { SplitResult } from '../lib/splitCalculator';

interface ParticipantListProps {
    participants: Participant[];
    splits: SplitResult[];
    currentUserId?: string;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, splits, currentUserId }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Participants</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {participants.map((participant) => {
                    const split = splits.find(s => s.participantId === participant.id);
                    const totalOwed = split ? split.totalOwed : 0;
                    const isMe = participant.id === currentUserId;

                    return (
                        <div key={participant.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors active:bg-gray-100">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0
                                    ${isMe ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                                `}>
                                    {participant.name.charAt(0).toUpperCase()}
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
                                <p className="font-bold text-gray-900 text-lg leading-none">฿{totalOwed.toLocaleString()}</p>
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
