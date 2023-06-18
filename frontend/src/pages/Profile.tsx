import React  from "react";
import "../components/Styles/ProfileStyles.css";
import { ProfileUser } from "../components/Utils/ProfileInfo.tsx";
import Friendlist from "../components/Utils/friendlist.tsx";

function Profile({socket}) {

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
                  <Friendlist socket={socket} />
              </div>
          </div>
        </div>
    );
}

export default Profile;