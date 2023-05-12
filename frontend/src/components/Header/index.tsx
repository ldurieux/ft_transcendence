import React, { useState } from "react";
import { startTransition } from "react";

const Header = () => {
    //getAvatar from profile.tsx
    const avatar = localStorage.getItem('avatar');
    const nickname = localStorage.getItem('nickname');
    const login = localStorage.getItem('login');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebarOpen = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClick = () => {
        toggleSidebarOpen();
    };

    const logOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('login');
        localStorage.removeItem('avatar');
        localStorage.removeItem('nickname');
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
                <a onClick={() => startTransition(() => {
                    window.location.href = "/login";})}>
                    <i className='bx bx-log-in'></i>
                    <span className="links_name">Login</span>
                </a>
            </li>
            <li>
                <a onClick={() => startTransition(() => {
                    window.location.href = "/Game";})}>
                    <i className='bx bx-game'></i>
                    <span className="links_name">Game</span>
                </a>
            </li>
            <li>
                <a onClick={() => startTransition(() => {
                    window.location.href = "/profile";})}>
                    <i className='bx bx-user-circle'></i>
                    <span className="links_name">Profile</span>
                </a>
            </li>
            <li>
                <a onClick={() => startTransition(() => {
                    window.location.href = "/leaderboard";})}>
                    <i className='bx bx-list-ol'></i>
                    <span className="links_name">Leaderboard</span>
                </a>
            </li>
            <li>
                <a onClick={() => startTransition(() => {
                    window.location.href = "/chat";})}>
                    <i className='bx bx-chat'></i>
                    <span className="links_name">Chat</span>
                </a>
            </li>
            <li>
          <div className="profile-details">
                <div className="profile-content">
                    <img src={avatar} alt="profileImg"/>
                </div>

                <div className="login-nickname">
                    <div className="login">{login}</div>
                    <div className="nickname">{nickname}</div>
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