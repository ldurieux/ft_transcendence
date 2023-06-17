import React from "react";
import { Routes, Route } from "react-router-dom";

const Profile = React.lazy(() => import("../pages/Profile.tsx"));
const Authentication = React.lazy(() => import("../pages/Authentication.tsx"));
const Game = React.lazy(() => import("../pages/Game.tsx"));
const Leaderboard = React.lazy(() => import("../pages/Leaderboard.tsx"));
const Chat = React.lazy(() => import("../pages/Chat.tsx"));


const FrontRoutes = ({socket}) => {

    return (
        <Routes>
            <Route path="/login" element={<Authentication />} />
            <Route path="/profile" element={
                    <Profile />
            } />
            <Route path="/game" element={<Game socket={socket}/>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/chat" element={<Chat socket={socket}/>} />
        </Routes>
    );
}

export default FrontRoutes;