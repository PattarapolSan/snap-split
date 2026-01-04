import type { Item, Assignment, Participant } from '@snap-split/shared';

export interface SplitResult {
    participantId: string;
    participantName: string;
    totalOwed: number;
    items: {
        itemId: string;
        amount: number;
    }[];
}

export const calculateSplits = (
    items: Item[],
    assignments: Assignment[],
    participants: Participant[]
): SplitResult[] => {
    // Initialize map for results
    const participantMap = new Map<string, SplitResult>();

    participants.forEach(p => {
        participantMap.set(p.id, {
            participantId: p.id,
            participantName: p.name,
            totalOwed: 0,
            items: []
        });
    });

    // Calculate splits
    items.forEach(item => {
        // Find all assignments for this item
        const itemAssignments = assignments.filter(a => a.item_id === item.id);

        itemAssignments.forEach(assignment => {
            const participantResult = participantMap.get(assignment.participant_id);

            if (participantResult) {
                // Calculate share based on percentage (normalized)
                const totalPercentage = itemAssignments.reduce((sum, a) => sum + (a.percentage || 100), 0);
                const shareRatio = (assignment.percentage || 100) / totalPercentage;

                // Item total price (price is treated as total line amount)
                const itemTotal = item.price;
                const shareAmount = itemTotal * shareRatio;

                participantResult.items.push({
                    itemId: item.id,
                    amount: shareAmount
                });

                participantResult.totalOwed += shareAmount;
            }
        });
    });

    return Array.from(participantMap.values());
};
