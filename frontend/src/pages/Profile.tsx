import React, { Component } from "react";
import "../components/Styles/ProfileStyles.css";
import { ProfileUser } from "../components/Utils/ProfileInfo.tsx";
import UserContext from "../components/Utils/context.tsx";
import FriendList from "../components/Utils/friendlist.tsx";

class Profile extends Component {
    static contextType = UserContext;

    render() {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }

    return (
        <div className="ProfileHeader">
            <h1>Transcendance</h1>
          <div className="ProfileBody">
              <ProfileUser/>
              <div className="Right">
                    <FriendList />
              </div>
          </div>

        </div>
    );
  }
}

export default Profile;