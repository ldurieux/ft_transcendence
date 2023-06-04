import React from "react";
import "../Styles/listStyles.css";

function List({list, onClick, showList = false}) {
    return (
        <div className="list">
            {showList &&
                list.length > 0 &&
                list.map((item, key) => {
                    if (item.type !== "dm") {
                        return (
                            <li key={key} onClick={() => onClick(item)}>
                                {item?.display_name}
                            </li>
                        );
                }
                return null;
            })}
        </div>
    );
}

export default List;