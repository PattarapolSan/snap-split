import React from 'react';
import type { SplitResult } from '../lib/splitCalculator';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    splits: SplitResult[];
    roomName: string;
    roomCode: string;
    creatorName: string;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
    isOpen,
    onClose,
    splits,
    roomName,
    roomCode,
    creatorName
}) => {
    if (!isOpen) return null;

    const totalBill = splits.reduce((sum, s) => sum + s.totalOwed, 0);

    const handleCopy = () => {
        // In store, we use real IDs. We need to find names.
        // The SplitResult only has participantId.
        // We should probably pass participants map or list to look up names.
        // Or update SplitResult to include name.
        // For MVP, let's assume we can lookup or that I need to update this component to take a lookupMap.
        const simpleLines = [
            `Room: ${roomName} (${roomCode})`,
            '',
            ...splits.map(s => `${s.participantName}: ${s.totalOwed.toFixed(2)}`),
            '',
            `Total: ${totalBill.toFixed(2)}`,
            '',
            `💰 Pay to: ${creatorName}`,
            `🔗 ${window.location.origin}/room/${roomCode}`
        ];

        navigator.clipboard.writeText(simpleLines.join('\n'));
        alert('Summary copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-fade-in shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4 text-gray-900">Bill Summary</h2>

                <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
                    {splits.map(split => (
                        <div key={split.participantId} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <span className="font-medium text-gray-700">
                                {split.participantName}
                            </span>
                            <span className="font-bold text-gray-900">
                                {split.totalOwed.toFixed(2)}
                            </span>
                        </div>
                    ))}

                    <div className="flex justify-between items-center py-3 mt-2 border-t border-gray-100">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-primary-600 text-lg">
                            {totalBill.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleCopy}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <span>📋</span> Copy for Group Chat
                    </button>
                    <p className="text-xs text-center text-gray-400">
                        Send this to your LINE / WhatsApp group
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
