import React, { useContext } from "react";
import { PopupContext } from "./PopupContext.tsx";
import "../../Styles/PopupStyles.css";
import { post } from "../Request.tsx";

function PopupSettings() {
    const { showPopup, setShowPopup } = useContext(PopupContext);

}

export default PopupSettings;
