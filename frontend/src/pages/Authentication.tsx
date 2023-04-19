import React, { Component } from "react";
import "../components/Styles/LoginStyles.css";
class Authentication extends Component {
  render() {
    return (
      <div className="AuthBody">
        <form>
          <label>
            Nickname :
            <input type="text" name="name" />
          </label>
          <input type="submit" value="Envoyer" />
        </form>
      </div>
    );
  }
}

export default Authentication;