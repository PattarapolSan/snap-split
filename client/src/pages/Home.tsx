import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SnapSplit</h1>
            <p className="text-gray-600 mb-10 text-lg text-center">Split bills easily with friends. No login required.</p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/create')}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl shadow-sm transition-all"
                >
                    Create New Bill
                </button>
                <button
                    onClick={() => navigate('/join')}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-4 px-6 rounded-xl shadow-sm transition-all"
                >
                    Join Existing Bill
                </button>
            </div>
        </div>
    );
};

export default Home;
