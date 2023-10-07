import React, { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PopupProvider } from "./components/Utils/chatComponents/PopupContext.tsx";
import SocketService from "./components/Utils/SocketService.tsx";
import './App.css';
const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {
    const socketService = new SocketService();
    let visibilityChange = null;


    const socket = useMemo(() => {
        if (document.visibilityState === 'visible') {
            socketService.connect();
        }

        return (socketService.getSocket());
    }, [socketService]);

    return (
        <div className="App-header">
            <PopupProvider>
                <div className="App">
                    <BrowserRouter>
                        <Header />
                        <FrontRoute socket={socket} />
                        {visibilityChange &&
                        <div className="InvitePopup">
                            <div className="InvitePopupContent">
                                <div className="InvitePopupHeader">
                                    <h1>Invitation</h1>
                                </div>
                                <div className="InvitePopupBody">
                                    <div className="InvitePopupText">
                                    </div>
                                    <div className="InvitePopupButtons">
                                        <button className="InvitePopupButtonA" onClick={() => {}}>Accept</button>
                                        <button className="InvitePopupButtonR" onClick={() => {}}>Decline</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </BrowserRouter>
                </div>
            </PopupProvider>
        </div>
    );
}

export default App;
