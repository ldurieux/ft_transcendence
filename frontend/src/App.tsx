import React, {useEffect, useState} from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PopupProvider } from "./components/Utils/chatComponents/PopupContext.tsx";

const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    // const {setSocket} = useContext(SocketContext);
    const socket = new WebSocket(url);

    useEffect(() => {
        socket.onopen = () => {
            const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
            socket.send(JSON.stringify(baguette));
            console.log('Connected to server');
            // setSocket(socket);
        };

        socket.onclose = () => {
            console.log('Disconnected from server');
        };
        // Clean up function
        return () => {
            socket.close();
        };
    }, [url, socket]);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (event.data === 'gameStart') {
            window.location.href = '/game';
        }
        console.log(data);
    };

    return (
        <div className="App-header">
            <PopupProvider>
                {/*<SocketProvider>*/}
                    <div className="App">
                        <BrowserRouter>
                            <Header />
                            <FrontRoute socket={socket}/>
                        </BrowserRouter>
                    </div>
                {/*</SocketProvider>*/}
            </PopupProvider>
        </div>
    );
}

export default App;
