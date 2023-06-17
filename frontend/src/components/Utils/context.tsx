import React, { createContext, useState } from "react";

interface UserContextProps {
    user: {
        isLoggedIn: boolean;
    };
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

export const UserContext = createContext<UserContextProps>({
    user: { isLoggedIn: false },
    setUser: () => {},
});

export const UserProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState({ isLoggedIn: false });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

//context for socket connection
// interface SocketContextProps {
//     socket: {
//         ws: WebSocket;
//     }
//     setSocket: React.Dispatch<React.SetStateAction<any>>;
// }
//
// export const SocketContext = createContext<SocketContextProps>({
//     socket: { ws: null },
//     setSocket: () => {},
// });
//
// export const SocketProvider: React.FC = ({ children }) => {
//     const [socket, setSocket] = useState({ ws: null });
//
//     return (
//         <SocketContext.Provider value={{ socket, setSocket }}>
//             {children}
//         </SocketContext.Provider>
//     );
// }

export default UserContext;
