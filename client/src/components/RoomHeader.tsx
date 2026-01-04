import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
    roomCode: string;
    roomName: string;
    participantCount: number;
    taxRate: number;
    serviceChargeRate: number;
    canDelete?: boolean;
    onDelete?: () => void;
    onUpdateRates?: (taxRate: number, serviceChargeRate: number) => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
    roomCode,
    roomName,
    participantCount,
    taxRate,
    serviceChargeRate,
    canDelete,
    onDelete,
    onUpdateRates
}) => {
    const navigate = useNavigate();
    const [showQR, setShowQR] = useState(false);
    const [showRates, setShowRates] = useState(false);
    const [tempTax, setTempTax] = useState(taxRate);
    const [tempSC, setTempSC] = useState(serviceChargeRate);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const joinUrl = `${window.location.origin}/join?code=${roomCode}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this bill? This cannot be undone.')) {
            onDelete?.();
        }
    };

    const handleSaveRates = () => {
        onUpdateRates?.(tempTax, tempSC);
        setShowRates(false);
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
                                    {copied ? 'Copied!' : 'Copy Link'}
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
                        <div className="flex flex-col items-end gap-1">
                            <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                {participantCount} participants
                            </div>
                            <div className="text-[10px] font-bold text-primary-500 uppercase tracking-tighter">
                                {serviceChargeRate}% SC • {taxRate}% Tax
                            </div>
                        </div>
                        {canDelete && (
                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={() => {
                                        setTempTax(taxRate);
                                        setTempSC(serviceChargeRate);
                                        setShowRates(true);
                                    }}
                                    className="text-xs text-primary-600 font-semibold hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                    Edit Rates
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="text-xs text-red-500 font-semibold hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                    Delete Bill
                                </button>
                            </div>
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
            {showRates && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowRates(false)}>
                    <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 text-gray-900 flex items-center gap-2">
                            🧾 Adjust Rates
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Charge (%)</label>
                                <input
                                    type="number"
                                    value={tempSC}
                                    onChange={e => setTempSC(Number(e.target.value))}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:border-primary-500 transition-all"
                                    placeholder="e.g. 10"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tax Rate (VAT/GST %)</label>
                                <input
                                    type="number"
                                    value={tempTax}
                                    onChange={e => setTempTax(Number(e.target.value))}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:border-primary-500 transition-all"
                                    placeholder="e.g. 7"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowRates(false)}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-3 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRates}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-primary-100 transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoomHeader;
