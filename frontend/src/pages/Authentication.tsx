import React, { Component } from "react";
import "../components/Styles/LoginStyles.css";

class Authentication extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
            message: ''
        };
    }
    async sendRequest(code: string) {
        try {
            const input = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/login`;
            const options = {method: 'POST', headers: {"Content-Type": "application/json"} ,body: JSON.stringify({method: '42', code: code})};
            const response = await fetch(input, options);
            if (response.status === 201) {
               let data = await response.json();
               const token = data.access_token;
               if (token) {
                   localStorage.setItem('token', token);
               }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

async componentDidMount() {

}

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
            }
        }
        catch (error) {
            console.log(error);
        }
    }

  render() {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search.slice(1));
        const code = params.get("code");
        if (code) {
            this.sendRequest(code);
        }
    return (

      <div className="AuthBody">
        <a href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_INTRA_ID}&redirect_uri=http%3A%2F%2F${process.env.REACT_APP_WEB_HOST}%3A${process.env.REACT_APP_FRONT_PORT}%2Flogin&response_type=code`}>
            Login <br/>
        </a>
          <div className="Username">
                <input type="text"
                       placeholder="Username"
                       onChange={(e) => this.HandleChange(e)}
                />
              <button onClick={() => this.HandleClick(this.state.message)}>Change Username</button>
          </div>
      </div>
    );
  }
}

export default Authentication;