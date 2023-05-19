import React from "react";
import {get} from "./Request.tsx";

async function login(): Promise<string> {
    try {
        const response = await get('user/self');
        return response?.auths?.[0]?.username ?? "--"
    } catch(_) {
        return "ya ruen"
    }
}

export { login };