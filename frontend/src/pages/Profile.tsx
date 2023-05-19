import React, { Component } from "react";
import "../components/Styles/ProfileStyles.css";
import { ProfileUser } from "../components/Utils/ProfileInfo.tsx";
import UserContext from "../components/Utils/context.tsx";

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
              <div className="Friends">
                  <div className="FriendsList">
                      <h2>Friends</h2>
                      <ul>
                          <li>Friend 1</li>
                          <li>Friend 2</li>
                          <li>Friend 3</li>
                      </ul>
                  </div>
                    <div className="AddFriend">
                        <h2>Add Friend</h2>
                        <input type="text" placeholder="Username"/>
                        <button>Add</button>
                    </div>
              </div>
              </div>
          </div>

        </div>
    );
  }
}

export default Profile;