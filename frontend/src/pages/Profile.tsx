import React, { Component } from "react";
import Avatar from "react-avatar";
import "../components/Styles/ProfileStyles.css";

class Profile extends Component {
  render() {
    return (
        <div className="ProfileHeader">
            <h1>Transcendance</h1>
          <div className="ProfileBody">
            <div className="Avatar">
                <Avatar name="Avatar" color="#777" size="300" round="200px"/>
            </div>
              <div className="User">
                  Nickname: <br/>
              </div>
          </div>
        </div>
    );
  }
}

export default Profile;