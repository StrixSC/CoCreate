import { sign, verify } from "jsonwebtoken";
import create from "http-errors";

const secret = process.env.ACCESS_TOKEN_SECRET;

export const signToken = (payload: any) => {
    try {
        return sign({ payload }, secret || 'secret', { expiresIn: process.env.TOKEN_EXPIRY_TIME || "1h" });
    } catch (e: any) {
        console.error(e);
        throw new create.InternalServerError("Unexpected error");
    }
}

export const verifyToken = (token: string) => {
    try {
        return verify(token, secret || 'secret');
    } catch (e: any) {
        console.error(e);
        throw new create.InternalServerError("Unexpected error");
    }
}