import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface RoomHeaderProps {
    roomCode: string;
    roomName: string;
    participantCount: number;
    canDelete?: boolean;
    onDelete?: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ roomCode, roomName, participantCount, canDelete, onDelete }) => {
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this bill? This cannot be undone.')) {
            onDelete?.();
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{roomName}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-3xl font-mono font-bold text-primary-600 tracking-wider p-2 bg-primary-50 rounded-lg border border-primary-100">
                                {roomCode}
                            </span>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handleCopy}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                                >
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                                <button
                                    onClick={() => setShowQR(true)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                                >
                                    Show QR
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                            {participantCount} participants
                        </div>
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Delete Bill
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showQR && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowQR(false)}>
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Scan to Join</h3>
                        <div className="flex justify-center mb-6">
                            <QRCodeSVG
                                value={`${window.location.origin}/join?code=${roomCode}`}
                                size={200}
                                level="H"
                                includeMargin
                            />
                        </div>
                        <p className="text-gray-500 mb-6 font-mono text-lg">{roomCode}</p>
                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoomHeader;
