import { Response } from "express"

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.accessToken) {
        console.log('tokenInfo.accessToken', tokenInfo.accessToken);

        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: false
        })
    }

    if (tokenInfo.refreshToken) {
        console.log('tokenInfo.refreshToken', tokenInfo.refreshToken);

        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: false
        })
    }
}