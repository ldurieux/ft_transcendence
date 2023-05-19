import React, { Component } from "react";
import "../components/Styles/ProfileStyles.css";
import { ProfileUser } from "../components/Utils/ProfileInfo.tsx";
import {UserContext} from "../components/Utils/context.tsx";

class Profile extends Component {

    async componentDidMount() {

    }


    onChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        try {
            console.log("file uploaded: ", e.target.files[0]);
            let file = e.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = this._handleReaderLoaded.bind(this);
                reader.readAsBinaryString(file);
                const url = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/picture`;
                const token = localStorage.getItem('token');
                let data = new FormData();
                data.append("image", file)
                const options: RequestInit = {
                    method: "POST",
                    headers: {"authorization": "Bearer " + token},
                    body: data
                };
                const response = await fetch(url, options);
                if (response.status === 200) {
                    console.log("Avatar uploaded");
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    _handleReaderLoaded = (e: ProgressEvent<FileReader>): void => {
        console.log("file uploaded 2: ", e);
        let binaryString = (e.target as FileReader).result as string;
        this.setState({
            avatar: `data:image;base64,` + btoa(binaryString)
        });
    };

    async HandleChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        try {
            let username = e.target.value;
            this.setState({message: username});
        }
        catch (error) {
            console.log(error);
        }
    }
    async HandleClick(username: string) {
        try {
            const input = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/username`;
            const token = localStorage.getItem('token');
            const options = {
                method: 'POST', headers: {"Content-Type": "application/json", "authorization": "Bearer " + token},
                body: JSON.stringify({username: username})
            };
            const response = await fetch(input, options);
            if (response.status === 200) {
                console.log("Username changed")
                localStorage.setItem('nickname', username);
                this.setState({nickname: username})
            }
            window.location.reload();
        }
        catch (error) {
            console.log(error);
        }
    }



    render() {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }

    return (
        <div className="ProfileHeader">
            <h1>Transcendance</h1>
          <div className="ProfileBody">
              {ProfileUser}
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