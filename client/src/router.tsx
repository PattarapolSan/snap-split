import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Room from './pages/Room';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/create',
        element: <CreateRoom />,
    },
    {
        path: '/join',
        element: <JoinRoom />,
    },
    {
        path: '/room/:code',
        element: <Room />,
    },
]);
