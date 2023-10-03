import React, { useState, useRef, useEffect } from "react";
import { post, get } from "./Request.tsx";
import {UserContext} from "./context.tsx";

function ProfileUser() {
    const {user, setUser} = React.useContext(UserContext);
    const inputRef = useRef(null);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("");
    const defaultAvatar = require("./42-logo.png");

    async function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    useEffect(() => {
        (async () => {
            const result = await get('user/self');
            console.log(result)
            setUser(result);
        })()
    }, [setUser])

   async function changeAvatar(e) {
        try {
            const avatar = e.target.files[0];
            const formData = new FormData();
            formData.append("image", avatar);

            const data = await post('user/picture', formData, true);

            if (data.profile_picture) {
                setUser((old) => ({
                    ...old,
                    profile_picture: data.profile_picture
                }));
            }
        }
        catch (error) {
            setError("Error changing avatar");
            await timeout(3000);
            setError(null);
        }
    }

    async function changeUsername(e) {
        try {
            const username = inputRef.current.value;
            const result = await post('user/username', {username: username});

            if (result.status === "modified") {
                setUser((old) => ({
                    ...old,
                    display_name: username
                }));
                setUsername("")
            }
        }
        catch (error) {
            setError("Error changing username");
            await timeout(3000);
            setError(null);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            changeUsername(username);
        }
    }

    // return (<div></div>);
    return (
        <div>
            <p className="popupError">
                {error}
            </p>
            <div className="Avatar">
                <label htmlFor="avatarInput">
                    <img
                        src={user?.profile_picture ?? defaultAvatar}
                        alt="Avatar"
                        width="100"
                        height="100"
                    />
                </label>
                <input
                    type="file"
                    id="avatarInput"
                    name="avatarInput"
                    accept=".png, .jpeg, .jpg"
                    onChange={(e) => changeAvatar(e)}
                    style={{ display: "none" }}
                />
            </div>
            <div className="User">
                {user?.auths?.[0].username ?? "--"}
                <br />
            </div>
            <div className="Nickname">
                {user?.display_name ?? "--"}
            </div>
            <div className="Username">
                <input
                    ref={inputRef}
                    type="text"
                    maxLength={15}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={changeUsername}>Edit</button>
            </div>
        </div>
    );
}

export { ProfileUser };
