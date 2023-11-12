import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PopupProvider } from "./components/Utils/chatComponents/PopupContext.tsx";
import InvitePopup from "./components/Utils/popupComponents/invitePopup/popupInvite.tsx";
import './App.css';
const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    const [id, setId] = useState<number>(0);
    const [userName, setUserName] = useState<string>("");
    const [typeOfGame, setTypeOfGame] = useState<string>("");
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    
    const socket = useMemo(() => new WebSocket(url), [url]);

    useEffect(() => {
        socket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
                socket.send(JSON.stringify(baguette));
        };
        socket.onclose = () => {};
        
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [socket]);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible')
            if (socket.readyState === WebSocket.OPEN)
                socket.send(JSON.stringify({ event: 'focusOn' }));
    };
      
        document.addEventListener('visibilitychange', handleVisibilityChange);
      
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [socket]);
    
    useEffect(() => {
        if (socket) {
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "gameStart") {
                    window.location.href = "/game";
                }
                else if (data.type === "invite") {
                    setId(data.id);
                    setUserName(data.user);
                    if (data.typeOfGame === 1)
                        setTypeOfGame("classic game");
                    if (data.typeOfGame === 2)
                        setTypeOfGame("deluxe game");
                    setPopupVisible(true);
                }
                else if (data.type === "inviteTimeout")
                    setPopupVisible(false);
                else if (data.type === "inviteRefused")
                    setPopupVisible(false);
            }
        }
    },[socket]);

    const handleClose = () => {
        setPopupVisible(false);
    }

    return (
        <div className="App-header">
            {
                popupVisible ? (
                    <div className="popup-container">
                        <InvitePopup
                            props={{userName, typeOfGame, id}}
                            handleClose={handleClose}
                        />
                    </div>
                ) : null
            }
            <PopupProvider>
                <div className="App">
                    <BrowserRouter>
                        <Header />
                        <FrontRoute socket={socket} />
                    </BrowserRouter>
                </div>
            </PopupProvider>
        </div>
    );
}

export default App;
