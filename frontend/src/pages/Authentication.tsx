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
                   window.location.href = "/profile";
               }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    async getLogin() {
        try {
            const url = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/self`;
            const token = localStorage.getItem('token');
            const options: RequestInit = {
                method: 'GET',
                headers: { "Content-Type": "application/json", "authorization": "Bearer " + token }
            };
            const response = await fetch(url, options);
            if (response.status === 200) {
                let data = await response.json();
            }
        }
        catch (error) {
            console.log(error);
        }
    }

async componentDidMount() {

}



  render() {
        if (localStorage.getItem('token')) {
            window.location.href = "/profile";
        }
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
      </div>
    );
  }
}

export default Authentication;