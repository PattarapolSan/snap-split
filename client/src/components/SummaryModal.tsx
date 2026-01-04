import React from 'react';
import type { SplitResult } from '../lib/splitCalculator';
import { X, CheckCircle2, Share2, Banknote } from 'lucide-react';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    splits: SplitResult[];
    roomName: string;
    roomCode: string;
    creatorName: string;
    taxRate: number;
    serviceChargeRate: number;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
    isOpen,
    onClose,
    splits,
    roomName,
    roomCode,
    creatorName,
    taxRate,
    serviceChargeRate
}) => {
    const [copied, setCopied] = React.useState(false);
    if (!isOpen) return null;

    const totalBill = splits.reduce((sum, s) => sum + s.totalOwed, 0);

    const handleCopy = () => {
        const lines = [
            `🧾 *${roomName.toUpperCase()}*`,
            `Code: ${roomCode}`,
            `--------------------------`,
            ''
        ];

        const subtotal = splits.reduce((sum, s) => sum + s.subtotalOwed, 0);
        const serviceCharge = subtotal * (serviceChargeRate / 100);
        const tax = (subtotal + serviceCharge) * (taxRate / 100);

        splits.forEach(s => {
            if (s.totalOwed > 0) {
                lines.push(`👤 *${s.participantName}*`);
                s.items.forEach(item => {
                    lines.push(`- ${item.itemName}: ฿${item.amount.toLocaleString()}`);
                });
                if (serviceChargeRate > 0) lines.push(`- Service Charge (${serviceChargeRate}%): ฿${(s.subtotalOwed * (serviceChargeRate / 100)).toLocaleString()}`);
                if (taxRate > 0) lines.push(`- Tax (${taxRate}%): ฿${((s.subtotalOwed + (s.subtotalOwed * (serviceChargeRate / 100))) * (taxRate / 100)).toLocaleString()}`);
                lines.push(`💰 *Total: ฿${s.totalOwed.toLocaleString()}*`);
                lines.push('');
            }
        });

        lines.push(`--------------------------`);
        lines.push(`📍 Subtotal: ฿${subtotal.toLocaleString()}`);
        if (serviceChargeRate > 0) lines.push(`⚙️ Service Charge (${serviceChargeRate}%): ฿${serviceCharge.toLocaleString()}`);
        if (taxRate > 0) lines.push(`🏦 Tax (${taxRate}%): ฿${tax.toLocaleString()}`);
        lines.push(`🚩 Total Bill: ฿${totalBill.toLocaleString()}`);
        lines.push(`💸 Pay to: *${creatorName}*`);
        lines.push('');
        lines.push(`Join here: ${window.location.origin}/join?code=${roomCode}`);

        navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom duration-300 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                        <Banknote className="w-7 h-7 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">Bill Summary</h2>
                        <p className="text-gray-500 text-sm font-medium">{roomName}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {splits.filter(s => s.totalOwed > 0).map(split => (
                        <div key={split.participantId} className="py-4 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="block font-bold text-gray-900 truncate text-lg">
                                    {split.participantName}
                                </span>
                                <span className="font-black text-gray-900 text-lg">
                                    ฿{split.totalOwed.toLocaleString()}
                                </span>
                            </div>

                            <div className="space-y-1.5 border-t border-gray-200/50 pt-2 mt-2">
                                {split.items.map((item, idx) => (
                                    <div key={`${item.itemId}-${idx}`} className="flex justify-between text-[13px]">
                                        <span className="text-gray-500 truncate pr-4">{item.itemName}</span>
                                        <span className="text-gray-600 font-medium shrink-0">฿{item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                {serviceChargeRate > 0 && (
                                    <div className="flex justify-between text-[11px] font-medium text-gray-400 italic">
                                        <span>Service Charge ({serviceChargeRate}%)</span>
                                        <span>฿{(split.subtotalOwed * (serviceChargeRate / 100)).toLocaleString()}</span>
                                    </div>
                                )}
                                {taxRate > 0 && (
                                    <div className="flex justify-between text-[11px] font-medium text-gray-400 italic">
                                        <span>Tax ({taxRate}%)</span>
                                        <span>฿{((split.subtotalOwed + (split.subtotalOwed * (serviceChargeRate / 100))) * (taxRate / 100)).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="p-5 bg-primary-50 rounded-3xl border-2 border-primary-100 mt-2 space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold text-primary-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>฿{splits.reduce((sum, s) => sum + s.subtotalOwed, 0).toLocaleString()}</span>
                        </div>
                        {serviceChargeRate > 0 && (
                            <div className="flex justify-between items-center text-sm font-bold text-primary-400 uppercase tracking-widest">
                                <span>Service Charge ({serviceChargeRate}%)</span>
                                <span>฿{(splits.reduce((sum, s) => sum + s.subtotalOwed, 0) * (serviceChargeRate / 100)).toLocaleString()}</span>
                            </div>
                        )}
                        {taxRate > 0 && (
                            <div className="flex justify-between items-center text-sm font-bold text-primary-400 uppercase tracking-widest">
                                <span>Tax ({taxRate}%)</span>
                                <span>฿{((splits.reduce((sum, s) => sum + s.subtotalOwed, 0) + (splits.reduce((sum, s) => sum + s.subtotalOwed, 0) * (serviceChargeRate / 100))) * (taxRate / 100)).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-primary-200/50">
                            <span className="font-black text-primary-900 uppercase tracking-widest text-sm">Total Bill</span>
                            <span className="font-black text-primary-700 text-3xl">
                                ฿{totalBill.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl">👉</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Pay to</p>
                            <p className="font-bold text-orange-900">{creatorName}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`
                            w-full font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg
                            ${copied
                                ? 'bg-green-500 text-white shadow-green-100'
                                : 'bg-primary-600 text-white shadow-primary-100 hover:bg-primary-700'
                            }
                        `}
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                Copied for Group Chat!
                            </>
                        ) : (
                            <>
                                <Share2 className="w-6 h-6" />
                                Share with Friends
                            </>
                        )}
                    </button>
                    <p className="text-xs text-center text-gray-400 font-medium">
                        Send this breakdown to your Line or WhatsApp group
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
