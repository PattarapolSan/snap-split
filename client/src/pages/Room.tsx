import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useRoomStore } from '../store/roomStore';
import { api } from '../lib/api';
import RoomHeader from '../components/RoomHeader';
import ItemList from '../components/ItemList';
import ParticipantList from '../components/ParticipantList';
import SummaryModal from '../components/SummaryModal';
import ReceiptUploader from '../components/ReceiptUploader';

import { storage } from '../lib/storage';

const Room = () => {
    const { code } = useParams();
    const store = useRoomStore();
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        if (!code) return;

        // Check for local user identity
        const savedName = localStorage.getItem(`snap-split-user-${code}`);

        const fetchData = async () => {
            try {
                const data = await api.getRoomState(code);
                store.setRoomData(data);

                // Save to recent bills history
                storage.saveRoomVisit(code, data.name, savedName || undefined);

                if (savedName) {
                    const me = data.participants.find((p: any) => p.name === savedName);
                    if (me) store.setCurrentUser(me);
                }
                setLoading(false);
            } catch (e) {
                console.error(e);
                alert('Failed to load room');
            }
        };

        fetchData();

        // Socket Connection
        const isDev = import.meta.env.DEV;
        const socketUrl = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3001' : undefined);
        const socket = io(socketUrl);

        socket.on('connect', () => {
            socket.emit('join-room', code);
        });

        socket.on('participant-joined', (participant: any) => {
            store.addParticipant(participant);
        });

        socket.on('item-added', (item: any) => {
            store.addItem(item);
        });

        socket.on('item-updated', (item: any) => {
            store.updateItem(item.id, item);
        });

        socket.on('item-removed', (itemId: string) => {
            store.removeItem(itemId);
        });

        socket.on('assignment-added', (assignment: any) => {
            store.updateAssignment(assignment);
        });

        socket.on('assignment-removed', (assignmentId: string) => {
            store.removeAssignment(assignmentId);
        });

        return () => {
            socket.disconnect();
        };
    }, [code]);

    const handleAssign = async (itemId: string) => {
        if (!store.currentUser || !code) return;

        const existing = store.assignments.find(a =>
            a.item_id === itemId && a.participant_id === store.currentUser!.id
        );

        try {
            if (existing) {
                await api.removeAssignment(code, existing.id);
            } else {
                await api.assignItem(code, itemId, store.currentUser.id);
            }
        } catch (e) {
            console.error("Assignment failed", e);
        }
    };

    const handleEditItem = async (itemId: string, name: string, price: number, quantity: number) => {
        if (!code) return;
        try {
            await api.updateItem(code, itemId, name, price, quantity);
        } catch (e) {
            console.error('Failed to update item', e);
            alert('Failed to update item');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!code) return;
        try {
            await api.removeItem(code, itemId);
        } catch (e) {
            console.error('Failed to delete item', e);
            alert('Failed to delete item');
        }
    };

    const handleAddItem = async () => {
        // Temporary manual add item for testing
        const name = prompt("Item Name");
        if (!name) return;
        const priceStr = prompt("Item Price");
        if (!priceStr) return;
        const price = Number(priceStr);
        if (name && price && code && store.room) {
            await api.addItem(code, store.room.id, name, price, 1);
        }
    };

    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    const handleDeleteRoom = async () => {
        if (!code) return;
        try {
            await api.deleteRoom(code);
            window.location.href = '/'; // Simple redirect
        } catch (e) {
            console.error('Failed to delete room', e);
            alert('Failed to delete room');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading room...</div>;
    if (!store.room) return <div className="p-4 text-center">Room not found</div>;

    const isCreator = store.currentUser?.name === store.room.creator_name;

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 pb-28 sm:pb-32">
            <div className="max-w-xl mx-auto space-y-3 sm:space-y-4">
                <RoomHeader
                    roomCode={store.room.code}
                    roomName={store.room.name}
                    participantCount={store.participants.length}
                    canDelete={isCreator}
                    onDelete={handleDeleteRoom}
                />

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Items</h2>
                            <button onClick={handleAddItem} className="text-sm text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-lg">
                                + Manual Add
                            </button>
                        </div>
                        <ReceiptUploader
                            roomCode={store.room.code}
                            onItemsFound={(items) => {
                                // Items are already added by the uploader component via API
                                // But we might want to refresh or show a toast
                                console.log('Items added:', items);
                            }}
                        />
                    </div>
                    <ItemList
                        items={store.items}
                        assignments={store.assignments}
                        participants={store.participants}
                        currentUserId={store.currentUser?.id}
                        onAssign={handleAssign}
                        onDelete={handleDeleteItem}
                        onEdit={handleEditItem}
                    />
                </div>

                <ParticipantList
                    participants={store.participants}
                    splits={store.splits}
                    currentUserId={store.currentUser?.id}
                />

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                    <div className="max-w-xl mx-auto">
                        <button
                            onClick={() => setIsSummaryOpen(true)}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                        >
                            Export Summary
                        </button>
                    </div>
                </div>

                <SummaryModal
                    isOpen={isSummaryOpen}
                    onClose={() => setIsSummaryOpen(false)}
                    splits={store.splits}
                    roomName={store.room.name}
                    roomCode={store.room.code}
                    creatorName={store.room.creator_name}
                />
            </div>
        </div>
    );
};

export default Room;
