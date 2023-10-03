import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PopupProvider } from "./components/Utils/chatComponents/PopupContext.tsx";
import SocketService from "./components/Utils/SocketService.tsx";

const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {
    const socketService = new SocketService();

    useEffect(() => {
        if (document.visibilityState === 'visible') {
            socketService.connect();
        }

        return () => {
            socketService.disconnect();
        };
    }, [socketService]);

    return (
        <div className="App-header">
            <PopupProvider>
                <div className="App">
                    <BrowserRouter>
                        <Header />
                        <FrontRoute socket={socketService.getSocket()} />
                    </BrowserRouter>
                </div>
            </PopupProvider>
        </div>
    );
}

export default App;
