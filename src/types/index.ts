import { Message } from "whatsapp-web.js";

export interface WaBotMessage extends Message {
    _data?: {
        notifyName?: string;
    };
}

export interface ArjunResponse {
    object: string;
    message: string;
    isReply: boolean;
}