import type { Item, Assignment, Participant } from '@snap-split/shared';

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
                    amount: shareAmount
                });

                participantResult.subtotalOwed += shareAmount;
            }
        });
    });

    // Apply Tax & Service Charge to each participant's subtotal
    const results = Array.from(participantMap.values());
    results.forEach(res => {
        const serviceCharge = res.subtotalOwed * (serviceChargeRate / 100);
        const tax = (res.subtotalOwed + serviceCharge) * (taxRate / 100);
        res.totalOwed = res.subtotalOwed + serviceCharge + tax;
    });

    return results;
};
