import React, {useEffect, useState} from "react";
import { startTransition } from "react";
import { get } from "../Utils/Request.tsx";

const Header = () => {
    //getAvatar from profile.tsx
    const [user, setUser] = useState({});
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
        (async () => {
            if (localStorage.getItem('token')) {
                const result = await get('user/self');
                if (result)
                    setUser(result);
            }
        })();
        }, 5000);
        return () => clearInterval(interval);
    }, [])

    const toggleSidebarOpen = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClick = () => {
        toggleSidebarOpen();
    };

    const logOut = () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    }

  return (
      <div>
          <div className={`sidebar ${isSidebarOpen ? "close" : ""}`}>
          <div className="logo-details">
              <i className='bx bx-shield-alt-2'></i>
              <span className="logo_name">Menu</span>
          </div>
              <ul className={`nav-links ${isSidebarOpen ? "" : "close"}`}>
            <li>
                <p onClick={() => startTransition(() => {
                    window.location.href = "/login";})}>
                    <i className='bx bx-log-in'></i>
                    <span className="links_name">Login</span>
                </p>
            </li>
            <li>
                <p onClick={() => startTransition(() => {
                    window.location.href = "/Game";})}>
                    <i className='bx bx-game'></i>
                    <span className="links_name">Game</span>
                </p>
            </li>
            <li>
                <p onClick={() => startTransition(() => {
                    window.location.href = "/profile";})}>
                    <i className='bx bx-user-circle'></i>
                    <span className="links_name">Profile</span>
                </p>
            </li>
            <li>
                <p onClick={() => startTransition(() => {
                    window.location.href = "/leaderboard";})}>
                    <i className='bx bx-list-ol'></i>
                    <span className="links_name">Leaderboard</span>
                </p>
            </li>
            <li>
                <p onClick={() => startTransition(() => {
                    window.location.href = "/chat";})}>
                    <i className='bx bx-chat'></i>
                    <span className="links_name">Chat</span>
                </p>
            </li>
            <li>
          <div className="profile-details">
                <div className="profile-content">
                    <img src={user?.profile_picture} alt="profileImg"/>
                </div>

                <div className="login-nickname">
                    <div className="login">{user?.auths?.[0].username ?? "--"}</div>
                    <div className="nickname">{user?.display_name ?? "--"}</div>
                </div>
              <i className='bx bx-log-out' onClick={logOut}></i>


          </div>
            </li>
        </ul>
      </div>
          <section className="home-section">
                <div className="home-content">
                    <i className='bx bx-menu' onClick={handleSidebarClick}></i>
                    <span className="text">Home</span>
                </div>
          </section>
      </div>

  );
};

export default Header;