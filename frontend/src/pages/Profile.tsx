import React, { Component } from "react";
import "../components/Styles/ProfileStyles.css";
import { ProfileUser } from "../components/Utils/ProfileInfo.tsx";
import UserContext from "../components/Utils/context.tsx";
import FriendList from "../components/Utils/friendlist.tsx";

class Profile extends Component {
    static contextType = UserContext;

    render() {

    return (
        <div className="Profile">
            <div className="ProfileHeader">
                <h1>Profile</h1>
            </div>
          <div className="ProfileBody">
              <div className="Left">
                  <ProfileUser/>
              </div>
              <div className="Right">
                  <FriendList />
              </div>
          </div>
        </div>
    );
  }
}

export default Profile;