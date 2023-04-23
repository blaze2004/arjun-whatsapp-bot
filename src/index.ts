import axios from './utils/client';
// import qrcode from 'qrcode-terminal';
import fs from "fs";
import express from "express";
import { WAState, Events, Client, LocalAuth, MessageTypes } from 'whatsapp-web.js';
import { ArjunResponse, WaBotMessage } from './types';
import router from './routes';

const app=express();

export const client: Client=new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: `${__dirname}/session`,
    }),
});

client.on(Events.QR_RECEIVED, (qr: string) => {
    // qrcode.generate(qr, { small: true });
    console.log('QR code recieved.', qr);
    fs.writeFileSync("qr.txt", qr);
});

client.on(Events.READY, () => {
    console.log('Client is ready.');
});

client.on(Events.DISCONNECTED, (reason: WAState) => {
    client.destroy();
    console.log('Client was logged out', reason);
});

client.on(Events.AUTHENTICATION_FAILURE, (error: string) => {
    console.log('Authentication failure', error);
});

client.on(Events.MESSAGE_RECEIVED, async (message: WaBotMessage) => {

    if (message.type!=MessageTypes.TEXT) return;

    const messageData={
        name: message._data?.notifyName,
        phone: message.from.split("@")[0],
        body: message.body
    };

    try {
        const response=await axios.post('/api/v1/chat', {
            owner: "whatsapp_bot",
            messageObj: messageData
        });

        const data: ArjunResponse[]=response.data;

        for (let i=0; i<data.length; i++) {
            if (data[i].isReply) {
                await message.reply(data[i].message);
            }
            else {
                await client.sendMessage(message.from, data[i].message)
            }
        }

    } catch (error) {
        console.log("Error connecting to arjun. \nError: ", error);
        await message.reply("Look's like I am unable to connect to my server.\nReport the issue at shubham@visualbrahma.tech or try again after some time.");
    }

    const chat=await client.getChatById(message.from);
    await chat.delete();

    return;

});

app.use("/", router);

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

client.initialize();
