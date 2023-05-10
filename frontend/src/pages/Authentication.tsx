import React, { Component } from "react";
import "../components/Styles/LoginStyles.css";

class Authentication extends Component {

  render() {
    return (

      <div className="AuthBody">
        <a href='https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-daf495cf13fd1f090c114ac2c7c8c9c0c15d11dee8de959157b2c07821a76d0d&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code'>
            Login
        </a>
      </div>
    );
  }
}

export default Authentication;