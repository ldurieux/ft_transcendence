import React, { Children, useEffect, useState } from "react";
import { get, post } from "./Request.tsx";

function PongGame({Children}) {
    const [user, setUser] = useState([]);

    useEffect(() => {
        (async () => {
            const result = await get('user/self');
            setUser(result);
        })()
    }, [])

    return (
        <div>
            <p>
                {user?.display_name}
            </p>
        </div>
    );
}

export { PongGame };