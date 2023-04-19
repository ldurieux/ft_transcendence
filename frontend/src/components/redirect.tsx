import React from "react";
import { Routes, Route } from "react-router-dom";
const Profile = React.lazy(() => import("../pages/Profile.tsx"));
const Authentication = React.lazy(() => import("../pages/Authentication.tsx"));

const FrontRoutes = () => {
    return (
        <Routes>
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/profile" element={<Profile />} />
        </Routes>
    );
}

export default FrontRoutes;