import React, {useEffect, useContext, useRef, useState} from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PopupProvider } from "./components/Utils/chatComponents/PopupContext.tsx";
import { SocketProvider, SocketContext } from "./components/Utils/context.tsx";

const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    const socketRef = useRef<WebSocket | null>(null);
    const {setSocket} = useContext(SocketContext);
    const socket = new WebSocket(url);

    useEffect(() => {
        socketRef.current = socket;

        socket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
            socket.send(JSON.stringify(baguette));
            console.log('Connected to server');
            setSocket(socket);
        };

        socket.onclose = () => {
            console.log('Disconnected from server');
        };

        // Clean up function
        return () => {
            socketRef.current?.close();
        };
    }, [setSocket, url]);

    return (
        <div className="App-header">
            <PopupProvider>
                <SocketProvider>
                    <div className="App">
                        <BrowserRouter>
                            <Header />
                            <FrontRoute socket={socket}/>
                        </BrowserRouter>
                    </div>
                </SocketProvider>
            </PopupProvider>
        </div>
    );
}

export default App;
