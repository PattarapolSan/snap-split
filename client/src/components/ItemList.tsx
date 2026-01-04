import React from 'react';
import type { Item, Assignment, Participant } from '@snap-split/shared';
import { Trash2, Pencil } from 'lucide-react';

interface ItemListProps {
    items: Item[];
    assignments: Assignment[];
    participants: Participant[];
    taxRate: number;
    serviceChargeRate: number;
    currentUserId?: string;
    onAssign: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onEdit: (itemId: string, name: string, price: number, quantity: number) => void;
}

const ItemList: React.FC<ItemListProps> = ({
    items, assignments, participants, taxRate, serviceChargeRate, currentUserId, onAssign, onDelete, onEdit
}) => {
    // Calculate Subtotal (Items only)
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Calculate Grand Total
    const serviceCharge = subtotal * (serviceChargeRate / 100);
    const tax = (subtotal + serviceCharge) * (taxRate / 100);
    const grandTotal = subtotal + serviceCharge + tax;

    const handleEditClick = (e: React.MouseEvent, item: Item) => {
        e.stopPropagation();
        const newName = prompt("Item Name:", item.name);
        if (newName === null) return;

        const newPriceStr = prompt("Item Price:", item.price.toString());
        if (newPriceStr === null) return;
        const newPrice = parseFloat(newPriceStr);
        if (isNaN(newPrice)) {
            alert("Invalid price");
            return;
        }

        const newQtyStr = prompt("Quantity:", (item.quantity || 1).toString());
        if (newQtyStr === null) return;
        const newQuantity = parseInt(newQtyStr);
        if (isNaN(newQuantity)) {
            alert("Invalid quantity");
            return;
        }

        onEdit(item.id, newName, newPrice, newQuantity);
    };

    const handleDeleteClick = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        if (confirm('Delete this item?')) {
            onDelete(itemId);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>No items yet. Add some or upload a receipt!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Total Section */}
            <div className="p-4 bg-gray-900 text-white rounded-xl shadow-md space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Grand Total</span>
                    <span className="font-bold text-2xl">฿{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {(taxRate > 0 || serviceChargeRate > 0) && (
                    <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-800 pt-2">
                        <span>Items: ฿{subtotal.toLocaleString()}</span>
                        <div className="flex gap-3">
                            {serviceChargeRate > 0 && <span>SVC {serviceChargeRate}%</span>}
                            {taxRate > 0 && <span>TAX {taxRate}%</span>}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {items.map((item) => {
                    const itemAssignments = assignments.filter((a) => a.item_id === item.id);
                    const isAssignedToMe = currentUserId && itemAssignments.some((a) => a.participant_id === currentUserId);

                    const assignedNames = itemAssignments.map(a => {
                        const p = participants.find(p => p.id === a.participant_id);
                        return p?.name || 'Unknown';
                    });

                    // Item total price
                    const itemTotal = item.price * (item.quantity || 1);

                    return (
                        <div
                            key={item.id}
                            onClick={() => onAssign(item.id)}
                            className={`
                                relative p-4 rounded-xl border transition-all cursor-pointer select-none group
                                ${isAssignedToMe
                                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-gray-300'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className={`font-semibold truncate ${isAssignedToMe ? 'text-primary-900' : 'text-gray-900'}`}>
                                        {item.name}
                                        {item.quantity > 1 && <span className="text-sm text-gray-500 ml-2 font-normal">x{item.quantity}</span>}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {assignedNames.length > 0 ? (
                                            assignedNames.map((name, i) => (
                                                <span key={i} className="text-[10px] px-2 py-0.5 bg-white/60 rounded-full text-gray-600 border border-gray-100 font-medium">
                                                    {name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Tap to assign</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <span className={`font-bold text-lg ${isAssignedToMe ? 'text-primary-700' : 'text-gray-900'}`}>
                                        ฿{itemTotal.toLocaleString()}
                                    </span>

                                    <div className="flex gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleEditClick(e, item)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-gray-50 md:bg-transparent"
                                            aria-label="Edit Item"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-gray-50 md:bg-transparent"
                                            aria-label="Delete Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ItemList;
