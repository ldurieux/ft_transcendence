import React, { Component } from "react";
import "../components/Styles/ProfileStyles.css";

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            avatar: '',
            login: '',
            nickname: '',
            message: ''
        };
    }

    async componentDidMount() {
        await this.getAvatar();
    }
    async getAvatar() {
        try {
            if (!this.state.avatar) { // Vérifier si avatar est vide
                this.setState({ avatar: null });

                const url = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/self`;
                const token = localStorage.getItem('token');
                const options: RequestInit = {
                    method: 'GET',
                    headers: { "Content-Type": "application/json", "authorization": "Bearer " + token }
                };
                const response = await fetch(url, options);
                if (response.status === 200) {
                    let data = await response.json();
                    const avatar = data.profile_picture;
                    const login = data.auths[0].username;
                    const nickname = data.display_name;
                    if (avatar) {
                        this.setState({ avatar: avatar, login: login, nickname: nickname }, () => {
                            // Callback appelée après la mise à jour de l'état
                        });
                        localStorage.setItem('avatar', avatar);
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
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
        const { avatar, login, nickname } = this.state;
        localStorage.setItem('avatar', avatar);
        localStorage.setItem('login', login);
        localStorage.setItem('nickname', nickname);

    return (
        <div className="ProfileHeader">
            <h1>Transcendance</h1>
          <div className="ProfileBody">
            <div className="Avatar">
                <label htmlFor="avatarInput">
                    <img src={avatar} alt="Avatar" width="300" height="300" />
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
                  {login}
                  <br/>
              </div>
              <div className="ZoneNickName">
                <div className="Nickname">
                    {nickname}

                </div>
              <div className="edit-nick">
                  <a onClick={() => this.HandleClick(this.state.message)}>Edit</a>
              </div>
             </div>
              <div className="Username">
                  <input type="text"
                         placeholder="Username"
                         onChange={(e) => this.HandleChange(e)}
                  />
                  <button onClick={() => this.HandleClick(this.state.message)}>Change Username</button>
              </div>
          </div>
        </div>
    );
  }
}

export default Profile;