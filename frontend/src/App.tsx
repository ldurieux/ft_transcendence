import React, {useEffect, useState} from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PopupProvider } from "./components/Utils/chatComponents/PopupContext.tsx";

const Header = React.lazy(() => import('./components/Header/index.tsx'));
const FrontRoute = React.lazy(() => import('./components/redirect.tsx'));

function App() {
    const url = `ws://${process.env.REACT_APP_WEB_HOST}:3001`;
    // const {setSocket} = useContext(SocketContext);
    const socket = new WebSocket(url);
    const [popupContent, setPopupContent] = useState({});

    useEffect(() => {
        if (document.visibilityState === 'visible') {
            socket.onopen = () => {
                const baguette = { event: 'auth', data: { data: `Bearer ${localStorage.getItem('token')}` } };
                socket.send(JSON.stringify(baguette));
                console.log('connected to server');
            };
        } else {
            socket.onclose = () => {
                console.log('disconnected from server');
            };
        }


        return () => {
            if (socket.readyState === WebSocket.OPEN)
            {
                console.log('closing socket');
                socket.close();
            }
        };

    }, [url, socket, document.visibilityState]);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === 'gameStart') {
            window.location.href = '/game';
        }
        if (data.type === 'invite') 
        {
            setPopupContent({user: data.user, typeOfGame: data.typeOfGame});
        }
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
