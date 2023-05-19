import React, { useEffect, useState} from "react";
import { UserContext } from "./context.tsx";

interface props {
    children: JSX.Element;
}

function User(props: props) {
    const [user, setUser] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!localStorage.getItem('token'))
                    return ;
                const url = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/self`;
                const token = localStorage.getItem('token');
                const options: RequestInit = {
                    method: 'GET',
                    headers: { "Content-Type": "application/json", "authorization": "Bearer " + token }
                };
                const response = await fetch(url, options);
                if (response.status === 200) {
                    let data = await response.json();
                    setUser(data);
                }
            }
            catch (error) {
                console.log(error);
            }
        };
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={user}>
            {props.children}
        </UserContext.Provider>
    );
}

export default User