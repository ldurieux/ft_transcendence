import React, {useEffect, useState} from "react";
import popupStyles from "../Styles/PopupStyles.css";

function Popup(props: PopupProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    return (
        <div
            style={{
                visibility: show ? "visible" : "hidden",
                opacity: show ? "1" : "0"
            }}
            className={popupStyles.overlay}
        >
                <div className={popupStyles.content}>{props.children}</div>

        </div>
    );

}

interface PopupProps {
    title: string;
    show: boolean;
    onClose: (show: boolean) => void;
}

export default Popup;