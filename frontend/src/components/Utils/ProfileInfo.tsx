import React, {useContext} from "react";
import {UserContext} from "./context.tsx";
import "../Styles/ProfileStyles.css"

function ProfileUser() {
    const User: any = useContext(UserContext());

    return (
            <div className="Left">
                <div className="Avatar">
                    <label htmlFor="avatarInput">
                        <img src={User.profile_picture} alt="Avatar" width="300" height="300" />
                    </label>
                    <input
                        type="file"
                        id="avatarInput"
                        name="avatarInput"
                        accept=".png, .jpeg, .jpg"
                        onChange={this.onChange}
                        style={{ display: "none" }}
                    />
                </div>
                <div className="User">
                    <br/>
                    {User.auths[0].username}
                    <br/>
                </div>
                <div className="Nickname">
                    {User.display_name}

                </div>

                <div className="Username">
                    <input type="text"
                           placeholder="Username"
                           onChange={(e) => this.HandleChange(e)}
                    />
                    <button onClick={() => this.HandleClick(this.state.message)}>Edit</button>
                </div>
            </div>
    )
}

export default ProfileUser;