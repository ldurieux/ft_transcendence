import React, { Component } from "react";
import Avatar from "react-avatar";
import "../components/Styles/ProfileStyles.css";

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            avatar: '',
            login: '',
            nickname: ''
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



    render() {
        const { avatar, login, nickname } = this.state;

    return (
        <div className="ProfileHeader">
            <h1>Transcendance</h1>
          <div className="ProfileBody">
            <div className="Avatar">
                <Avatar src={avatar} size="300" color="#777" round="200px" />
            </div>
              <div className="User">
                  {login}
                  <br/>
              </div>
                <div className="Nickname">
                    {nickname}
                </div>
              <div className="SetAvatar">
                    <input type="file"
                           id="image"
                           name="image"
                           accept=".png, .jpeg, .jpg"
                           onChange={e => this.onChange(e)}
                    />
              </div>
          </div>
        </div>
    );
  }
}

export default Profile;