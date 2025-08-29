"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        // console.log('tokenInfo.accessToken', tokenInfo.accessToken);
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: false
        });
    }
    if (tokenInfo.refreshToken) {
        // console.log('tokenInfo.refreshToken', tokenInfo.refreshToken);
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: false
        });
    }
};
exports.setAuthCookie = setAuthCookie;
