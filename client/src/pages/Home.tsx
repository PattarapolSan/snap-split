import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { storage, type RecentRoom } from '../lib/storage';
import { Clock, Trash2, ChevronRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);

    useEffect(() => {
        setRecentRooms(storage.getRecentRooms());
    }, []);

    const handleRemoveRecent = (e: React.MouseEvent, code: string) => {
        e.stopPropagation();
        storage.removeRoom(code);
        setRecentRooms(storage.getRecentRooms());
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">SnapSplit</h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        The easiest way to split bills.<br />
                        <span className="text-primary-600">No login. No friction.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/create')}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-5 px-6 rounded-2xl shadow-lg shadow-primary-100 transition-all active:scale-[0.98] flex flex-col items-center gap-1"
                    >
                        <span className="text-xl">Create New</span>
                        <span className="text-xs font-normal opacity-80 underline underline-offset-2">Start a new bill</span>
                    </button>
                    <button
                        onClick={() => navigate('/join')}
                        className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-100 font-bold py-5 px-6 rounded-2xl shadow-sm transition-all active:scale-[0.98] flex flex-col items-center gap-1"
                    >
                        <span className="text-xl">Join Existing</span>
                        <span className="text-xs font-normal text-gray-400 underline underline-offset-2">Use room code</span>
                    </button>
                </div>

                {recentRooms.length > 0 && (
                    <div className="space-y-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Recent Bills
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {recentRooms.map((room) => (
                                <div
                                    key={room.code}
                                    onClick={() => navigate(`/room/${room.code}`)}
                                    className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all cursor-pointer flex justify-between items-center active:scale-[0.99]"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                            {room.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-gray-400 font-mono">
                                            <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">{room.code}</span>
                                            {room.userName && <span>· {room.userName}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => handleRemoveRecent(e, room.code)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            aria-label="Remove from history"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
