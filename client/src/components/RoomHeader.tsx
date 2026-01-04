import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
    roomCode: string;
    roomName: string;
    participantCount: number;
    canDelete?: boolean;
    onDelete?: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ roomCode, roomName, participantCount, canDelete, onDelete }) => {
    const navigate = useNavigate();
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
            <div className="mb-4 flex items-center gap-2">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all active:scale-90"
                    aria-label="Back to Home"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-500 uppercase tracking-tight">Viewing Bill</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-xl font-extrabold text-gray-900 truncate">{roomName}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-2xl sm:text-3xl font-mono font-bold text-primary-600 tracking-wider px-3 py-2 bg-primary-50 rounded-xl border border-primary-100 flex-shrink-0">
                                {roomCode}
                            </span>
                            <div className="flex flex-row sm:flex-col gap-1.5 flex-wrap">
                                <button
                                    onClick={handleCopy}
                                    className="px-3 py-1.5 sm:py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg transition-colors active:scale-95"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <button
                                    onClick={() => setShowQR(true)}
                                    className="px-3 py-1.5 sm:py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg transition-colors active:scale-95"
                                >
                                    QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                            {participantCount} participants
                        </div>
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-xs text-red-500 font-semibold hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
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
