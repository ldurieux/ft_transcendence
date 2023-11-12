import React from "react";
import { Routes, Route } from "react-router-dom";

const Profile = React.lazy(() => import("../pages/Profile.tsx"));
const Authentication = React.lazy(() => import("../pages/Authentication.tsx"));
const Lobby = React.lazy(() => import("../pages/lobby.tsx"));
const Leaderboard = React.lazy(() => import("../pages/Leaderboard.tsx"));
const Chat = React.lazy(() => import("../pages/Chat.tsx"));
const Game = React.lazy(() => import("../pages/Game.tsx"));
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage.tsx"));


const FrontRoutes = ({socket}) => {
    return (
        <Routes>
            <Route path="/" element={<Authentication />} />
            <Route path="/login" element={<Authentication />} />
            <Route path="/profile" element={<Profile socket={socket}/>} />
            <Route path="/lobby" element={<Lobby socket={socket}/>} />
            <Route path="/leaderboard" element={<Leaderboard/>} />
            <Route path="/chat" element={<Chat socket={socket}/>} />
            <Route path="/game" element={<Game/>} />
            <Route path="*" element={<NotFoundPage/>} />
        </Routes>
    );
}

export default FrontRoutes;