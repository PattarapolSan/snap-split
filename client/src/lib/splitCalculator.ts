import type { Item, Assignment, Participant } from '@snap-split/shared';

// For item breakdown lines (2 decimal places)
export const formatBaht = (amount: number): string =>
    amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// For per-person totals and grand total (rounded to whole baht)
export const formatBahtWhole = (amount: number): string =>
    Math.round(amount).toLocaleString();

export interface SplitResult {
    participantId: string;
    participantName: string;
    totalOwed: number;
    items: {
        itemId: string;
        itemName: string;
        amount: number;
    }[];
    subtotalOwed: number;
}

export const calculateSplits = (
    items: Item[],
    assignments: Assignment[],
    participants: Participant[],
    taxRate: number = 0,
    serviceChargeRate: number = 0
): SplitResult[] => {
    // Initialize map for results
    const participantMap = new Map<string, SplitResult>();

    participants.forEach(p => {
        participantMap.set(p.id, {
            participantId: p.id,
            participantName: p.name,
            totalOwed: 0,
            subtotalOwed: 0,
            items: []
        });
    });

    // Calculate subtotal splits
    items.forEach(item => {
        const itemAssignments = assignments.filter(a => a.item_id === item.id);

        itemAssignments.forEach(assignment => {
            const participantResult = participantMap.get(assignment.participant_id);

            if (participantResult) {
                const totalPercentage = itemAssignments.reduce((sum, a) => sum + (a.percentage || 100), 0);
                const shareRatio = (assignment.percentage || 100) / totalPercentage;

                const itemTotal = item.price * (item.quantity || 1);
                const shareAmount = itemTotal * shareRatio;

                participantResult.items.push({
                    itemId: item.id,
                    itemName: item.name,
                    amount: Math.round(shareAmount * 100) / 100
                });

                participantResult.subtotalOwed += shareAmount;
            }
        });
    });

    // Apply Tax & Service Charge to each participant's subtotal, then round finals
    const results = Array.from(participantMap.values());
    results.forEach(res => {
        res.subtotalOwed = Math.round(res.subtotalOwed * 100) / 100;
        const serviceCharge = res.subtotalOwed * (serviceChargeRate / 100);
        const tax = (res.subtotalOwed + serviceCharge) * (taxRate / 100);
        res.totalOwed = Math.round((res.subtotalOwed + serviceCharge + tax) * 100) / 100;
    });

    return results;
};
