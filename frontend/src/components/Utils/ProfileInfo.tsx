import React, {useEffect, useState, useRef } from "react";
import {get, post} from "./Request.tsx";



function ProfileUser({children}) {
    const [user, setUser] = useState({});
    const inputRef = useRef(null);
    const [error, setError] = useState(null);

    async function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    useEffect(() => {
        (async () => {
            const result = await get('user/self');
            setUser(result);
        })()
    }, [])

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
            }
        }
        catch (error) {
            setError("Error changing username");
            await timeout(3000);
            setError(null);
        }
    }

    // return (<div></div>);
    return (
        <div>
            <p className="popupError">
                {error}
            </p>
        <div className="Left">
            <div className="Avatar">
                <label htmlFor="avatarInput">
                    <img id="avatar" src={user?.profile_picture} alt="Avatar" width="300" height="300" />
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
                <br />
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
                    placeholder="Username"
                />
                <button onClick={changeUsername}>Edit</button>
            </div>
        </div>
        </div>
    );
}

export { ProfileUser };
