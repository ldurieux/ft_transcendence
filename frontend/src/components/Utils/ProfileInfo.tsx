import React, {useEffect, useState} from "react";
import {get, post} from "./Request.tsx";



function ProfileUser() {
    const [user, setUser] = useState({});
    // const [Username, setUsername] = useState(null);

    useEffect(() => {
        (async () => {
            const result = await get('user/self');
            console.log(result)
            setUser(result);
        })()
    }, [])

   async function changeAvatar(e) {
        try {
            const avatar = e.target.files[0];
            const formData = new FormData();
            formData.append("image", avatar);

            await post('user/picture', formData, true);
            setUser(await get('user/self'));

            // setUser((old) => ({
            //     ...old,
            //     profile_picture: "new base 64"
            // }));
        }
        catch (error) {
            console.log(error);
        }
    }

    // return (<div></div>);
    return (
        <div className="Left">
            <div className="Avatar">
                <label htmlFor="avatarInput">
                    <img id="avatar" src={user.profile_picture} alt="Avatar" width="300" height="300" />
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
                {user.display_name ?? "--"}
            </div>

            <div className="Username">
                <input type="text"
                       placeholder="Username"
                       onChange={(e) => this.HandleChange(e)}
                />
                <button onClick={() => this.HandleClick(this.state.message)}>Edit</button>
            </div>
        </div>
    );
}

export { ProfileUser };
