import React from "react";
import "../../Styles/PopupStyles.css";


function PopupSettings(settings, setShowPopup) {
    // const users = settings.users;
    // const owner = settings.owner;

    console.log(settings);

    return (
        <div className="popup">
        </div>
    );
    // return (
    //     <div className="popup">
    //         <div className="popup-inner">
    //             <div className="popup-header">
    //                 <div className="popup-title">{settings.display_name}</div>
    //                 <div className="popup-close" onClick={setShowPopup(false)}>
    //                     <i className="bx bx-x"></i>
    //                 </div>
    //             </div>
    //             <div className="popup-content">
    //                 <ul>
    //                     <li>Owner: {owner.display_name}</li>
    //                     <li>Users:</li>
    //                     <ul>
    //                         {users.map((user) => (
    //                             <li>{user.display_name}</li>
    //                         ))}
    //                     </ul>
    //                 </ul>
    //             </div>
    //         </div>
    //     </div>
    // );
}

export default PopupSettings;