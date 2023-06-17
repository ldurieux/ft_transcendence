import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../components/Utils/context.tsx";
import "../components/Styles/LoginStyles.css";
import {useNavigate} from "react-router-dom";

const Authentication = () => {
    const { setUser } = useContext(UserContext);
    let navigate = useNavigate();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const sendRequest = async (code) => {
            try {
                const input = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/login`;
                const options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ method: "42", code: code }),
                };
                const response = await fetch(input, options);
                if (response.status === 201) {
                    let data = await response.json();
                    const token = data.access_token;
                    if (token) {
                        localStorage.setItem("token", token);
                        setUser({ isLoggedIn: true }); // Définir isLoggedIn sur true
                        navigate("/profile");
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search.slice(1));
        const code = params.get("code");
        if (code) {
            sendRequest(code);
        }
    }, [setUser]);

    const logo = require("../components/Utils/42-logo.png");

    async function localConnection()
    {
        try {
            if (login === "" || password === "")
                return;
            const input = `http://${process.env.REACT_APP_WEB_HOST}:${process.env.REACT_APP_API_PORT}/user/login`;
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method: "local", username: login, password: password }),
            }
            const response = await fetch(input, options);
            if (response.status === 201) {
                let data = await response.json();
                const token = data.access_token;
                if (token) {
                    localStorage.setItem("token", token);
                    setUser({ isLoggedIn: true }); // Définir isLoggedIn sur true
                    navigate("/profile");
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="AuthBody">
            <a
                className="btn-42-login"
                href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_INTRA_ID}&redirect_uri=http%3A%2F%2F${process.env.REACT_APP_WEB_HOST}%3A${process.env.REACT_APP_FRONT_PORT}%2Flogin&response_type=code`}
            >
                <img src={logo} alt="42 logo" />
                <span className="separator">|</span>
                <span>Sign in as student</span>
            </a>
            <input
                className="input"
                type="text"
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />
            <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn-local-login" onClick={localConnection}>
                Sign in
            </button>
        </div>
    );
};

export default Authentication;
