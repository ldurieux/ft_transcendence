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

export default UserContext;
