// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { calculateSplits } from './splitCalculator';
import type { Item, Assignment, Participant } from '@snap-split/shared';

describe('calculateSplits', () => {
    it('should calculate simple equal split for one item', () => {
        const items: Item[] = [
            { id: '1', room_id: 'r1', name: 'Pizza', price: 100, quantity: 1 }
        ];
        const participants: Participant[] = [
            { id: 'p1', room_id: 'r1', name: 'Alice' },
            { id: 'p2', room_id: 'r1', name: 'Bob' }
        ];
        const assignments: Assignment[] = [
            { id: 'a1', item_id: '1', participant_id: 'p1', percentage: 50 },
            { id: 'a2', item_id: '1', participant_id: 'p2', percentage: 50 }
        ];

        const result = calculateSplits(items, assignments, participants);

        expect(result).toHaveLength(2);
        expect(result.find(r => r.participantId === 'p1')?.totalOwed).toBe(50);
        expect(result.find(r => r.participantId === 'p2')?.totalOwed).toBe(50);
    });

    it('should handle unequal splits', () => {
        const items: Item[] = [
            { id: '1', room_id: 'r1', name: 'Pizza', price: 100, quantity: 1 }
        ];
        const participants: Participant[] = [
            { id: 'p1', room_id: 'r1', name: 'Alice' },
            { id: 'p2', room_id: 'r1', name: 'Bob' }
        ];
        const assignments: Assignment[] = [
            { id: 'a1', item_id: '1', participant_id: 'p1', percentage: 75 },
            { id: 'a2', item_id: '1', participant_id: 'p2', percentage: 25 }
        ];

        const result = calculateSplits(items, assignments, participants);

        expect(result.find(r => r.participantId === 'p1')?.totalOwed).toBe(75);
        expect(result.find(r => r.participantId === 'p2')?.totalOwed).toBe(25);
    });

    it('should handle unassigned items (ignore them)', () => {
        const items: Item[] = [
            { id: '1', room_id: 'r1', name: 'Pizza', price: 100, quantity: 1 }
        ];
        const participants: Participant[] = [
            { id: 'p1', room_id: 'r1', name: 'Alice' }
        ];
        const assignments: Assignment[] = [];

        const result = calculateSplits(items, assignments, participants);
        expect(result.find(r => r.participantId === 'p1')?.totalOwed).toBe(0);
    });

    it('should handle multiple items', () => {
        const items: Item[] = [
            { id: '1', room_id: 'r1', name: 'Pizza', price: 100, quantity: 1 },
            { id: '2', room_id: 'r1', name: 'Coke', price: 20, quantity: 2 } // Total 40
        ];
        // Note: quantity logic needs to be handled.
        // If quantity is 2 and price is 20, is it 20 per item or 20 total?
        // In our plan, price is per unit.
        // Wait, the shared type says 'price: number'. Usually price is per unit.
        // Let's assume price is total price for simplicity or check plan.
        // Plan: "Coke x2 - 70". So price is likely total for the line item as entered from receipt.
        // Let's stick to: price is the TOTAL price for that line item entry.

        // Correction: In plan I wrote: "Coke x2 - $70".
        // So price in Item interface should be interpreted as "Total Price for this entry".
        // I will document this in implementation.

        const participants: Participant[] = [
            { id: 'p1', room_id: 'r1', name: 'Alice' },
            { id: 'p2', room_id: 'r1', name: 'Bob' }
        ];

        const assignments: Assignment[] = [
            { id: 'a1', item_id: '1', participant_id: 'p1', percentage: 100 }, // Alice pays all Pizza (100)
            { id: 'a2', item_id: '2', participant_id: 'p2', percentage: 50 }, // Bob pays half Coke (10)
            { id: 'a3', item_id: '2', participant_id: 'p1', percentage: 50 }  // Alice pays half Coke (10)
        ];

        const result = calculateSplits(items, assignments, participants);

        const alice = result.find(r => r.participantId === 'p1');
        const bob = result.find(r => r.participantId === 'p2');

        expect(alice?.totalOwed).toBe(110); // 100 + 10
        expect(bob?.totalOwed).toBe(10);   // 10

    });
});
