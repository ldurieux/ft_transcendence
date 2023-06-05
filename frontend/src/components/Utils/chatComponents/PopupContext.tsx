import React, { createContext, useState } from "react";

interface PopupContextProps {
    showPopup: boolean;
    setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PopupContext = createContext<PopupContextProps>({
    showPopup: false,
    setShowPopup: () => {},
});

export const PopupProvider: React.FC = ({ children }) => {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <PopupContext.Provider value={{ showPopup, setShowPopup }}>
            {children}
        </PopupContext.Provider>
    );
};

export default PopupContext;
