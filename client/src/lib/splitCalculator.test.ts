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

    it('should handle multiple items with quantity', () => {
        const items: Item[] = [
            { id: '1', room_id: 'r1', name: 'Pizza', price: 100, quantity: 1 },
            { id: '2', room_id: 'r1', name: 'Coke', price: 20, quantity: 2 } // Total 40
        ];

        const participants: Participant[] = [
            { id: 'p1', room_id: 'r1', name: 'Alice' },
            { id: 'p2', room_id: 'r1', name: 'Bob' }
        ];

        const assignments: Assignment[] = [
            { id: 'a1', item_id: '1', participant_id: 'p1', percentage: 100 }, // Alice pays all Pizza (100)
            { id: 'a2', item_id: '2', participant_id: 'p2', percentage: 50 }, // Bob pays half Coke (20)
            { id: 'a3', item_id: '2', participant_id: 'p1', percentage: 50 }  // Alice pays half Coke (20)
        ];

        const result = calculateSplits(items, assignments, participants);

        const alice = result.find(r => r.participantId === 'p1');
        const bob = result.find(r => r.participantId === 'p2');

        expect(alice?.totalOwed).toBe(120); // 100 + 20
        expect(bob?.totalOwed).toBe(20);   // 20
    });

    it('should calculate splits with tax and service charge', () => {
        const items: Item[] = [
            { id: '1', room_id: 'r1', name: 'Pizza', price: 100, quantity: 1 }
        ];
        const participants: Participant[] = [
            { id: 'p1', room_id: 'r1', name: 'Alice' }
        ];
        const assignments: Assignment[] = [
            { id: 'a1', item_id: '1', participant_id: 'p1', percentage: 100 }
        ];

        // 10% Service Charge + 7% Tax
        const result = calculateSplits(items, assignments, participants, 7, 10);

        const alice = result.find(r => r.participantId === 'p1');

        // 100 + 10 (SC) = 110
        // 110 * 1.07 (Tax) = 117.7
        expect(alice?.totalOwed).toBeCloseTo(117.7, 2);
    });
});
