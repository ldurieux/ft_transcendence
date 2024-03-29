import React, {useEffect, useState, useContext} from "react";
import { startTransition } from "react";
import { get } from "../Utils/Request.tsx";
import {UserContext} from "../Utils/context.tsx";

const Header = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const {user, setUser} = useContext(UserContext);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const result = await get('user/self');
                setUser(result);
            } catch (error) {
                console.error(error);
            }
        };

        if (localStorage.getItem('token')) {
            checkAuthentication();
        }
    }, [setUser]);


    const logOut = () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    }

    const toggleSidebarOpen = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClick = () => {
        toggleSidebarOpen();
    };



  return (
    // if we are on /Game, we don't want to display the header
    
    window.location.pathname === "/Game" ? null :
      <div>
          <div className={`sidebar ${isSidebarOpen ? "close" : ""}`}>
          <div className="logo-details">
              <i className='bx bx-shield-alt-2'></i>
              <span className="logo_name">Menu</span>
          </div>
              <ul className={`nav-links ${isSidebarOpen ? "" : "close"}`}>
            <li>
                <p onClick={() => startTransition(() => {
                    window.location.href = "/profile";})}>
                    <i className='bx bx-user-circle'></i>
                    <span className="links_name">Profile</span>
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
                <p onClick={() => startTransition(() => {
                    window.location.href = "/lobby";})}>
                    <i className='bx bx-game'></i>
                    <span className="links_name">Lobby</span>
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
                    window.location.href = "/login";})}>
                    <i className='bx bx-log-in'></i>
                    <span className="links_name">Login</span>
                </p>
            </li>
            <li>
          <div className="profile-details">
                <div className="profile-content">
                    <img src={user?.profile_picture} alt=""/>
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