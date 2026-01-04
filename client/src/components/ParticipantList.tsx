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
                <h3 className="font-semibold text-gray-900">Participants</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {participants.map((participant) => {
                    const split = splits.find(s => s.participantId === participant.id);
                    const totalOwed = split ? split.totalOwed : 0;
                    const isMe = participant.id === currentUserId;

                    return (
                        <div key={participant.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${isMe ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                `}>
                                    {participant.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {participant.name}
                                        {isMe && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {split?.items.length || 0} items
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">฿{totalOwed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                {participant.paid ? (
                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Paid</span>
                                ) : (
                                    <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">Unpaid</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ParticipantList;
