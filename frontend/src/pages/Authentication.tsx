import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../components/Utils/context.tsx";
import "../components/Styles/LoginStyles.css";
import {useNavigate} from "react-router-dom";
import {post} from "../components/Utils/Request.tsx";

const Authentication = () => {
    const { user, setUser } = useContext(UserContext);
    let navigate = useNavigate();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [twoFaCode, setTwoFaCode] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [show, setShow] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [code, setCode] = useState("");

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
                console.log(response)
                if (response.status === 201) {
                    let data = await response.json();
                    const token = data.access_token;
                    if (token && data.twoFaEnabled === false) {
                        localStorage.setItem("token", token);
                        setUser({isLoggedIn: true}); // Définir isLoggedIn sur true
                        navigate("/profile");
                    }
                    else if(token && data.twoFaEnabled === true) {
                        setEnabled(true);
                        localStorage.setItem("token", token);
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
    }, [setUser, navigate]);

    const logo = require("../components/Utils/42-logo.png");

    async function sendTwoFa(e) {
        if (e.key === "Enter") {
            const ret = await post("user/login2fa", {code: twoFaCode});
            if (ret.access_token) {
                localStorage.removeItem("token");
                localStorage.setItem("token", ret.access_token);
                setUser({isLoggedIn: true}); // Définir isLoggedIn sur true
                navigate("/profile");
            }
        }
    }

    async function createTwoFa() {
        setShow(true);
        const Code = await post("user/generate2fa");
        setQrCode(Code.qrcode);
    }

    async function sendCode(e) {
        if (e.key === "Enter") {
            await post("user/enable2fa", {code: code});
            setEnabled(true);
            navigate("/profile");
        }
    }

    async function disableTwoFa() {
        await post("user/disable2fa");
        setEnabled(false);
        navigate("/profile");
    }

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
            {show &&
            <div className="Popup">

                    <div className="Popup-inner">
                        <div className="Popup-header">
                            <h2>2FA</h2>
                            <button className="Popup-close" onClick={() => setShow(false)}>X</button>
                        </div>
                        <div className="Popup-body">
                            <p>Scan this QR code with your 2FA app</p>
                            <img src={qrCode} alt="QR Code"/>
                            <p>Then enter the code</p>
                            <input
                                className="input"
                                type="text"
                                placeholder="2FA Code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onKeyDown={sendCode}
                            />
                        </div>
                    </div>

            </div>
            }
            <div>
                {user.isLoggedIn === false &&
                    <a
                    className="btn-42-login"
                    href={`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_INTRA_ID}&redirect_uri=http%3A%2F%2F${process.env.REACT_APP_WEB_HOST}%3A${process.env.REACT_APP_FRONT_PORT}%2Flogin&response_type=code`}
                >
                    <img src={logo} alt="42 logo"/>
                    <span className="separator">|</span>
                    <span>Sign in as student</span>
                </a>}
            </div>
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
            <div className="TwoFA">
                {enabled &&
                    <input
                        className="input"
                        type="text"
                        placeholder="2FA Code"
                        value={twoFaCode}
                        onChange={(e) => setTwoFaCode(e.target.value)}
                        onKeyDown={sendTwoFa}
                    />
                }
                {user.twoFaEnabled === false &&
                    <button className="EnableTwoFA"
                            onClick={createTwoFa}
                    >
                        Enable 2FA
                    </button>
                }
                {user.twoFaEnabled === true &&
                    <div className="DisableTwoFA">
                        <button onClick={disableTwoFa}>
                            Disable 2FA
                        </button>
                    </div>
                }
            </div>
        </div>
    );
};

export default Authentication;
