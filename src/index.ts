import axios from './utils/client';
import qrcode from 'qrcode-terminal';
import fs from "fs";
import express, { Request, Response } from "express";
import { WAState, Events, Client, LocalAuth, MessageTypes } from 'whatsapp-web.js';
import { ArjunResponse, WaBotMessage } from './types';

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
        await message.reply("Look's like I am unable to connect to my server.\nReport the issue at shubhamtiwaripython2004@gmail.com or try again after some time.");
    }

    const chat=await client.getChatById(message.from);
    await chat.delete();

    return;

});

app.get("/", (req: Request, res: Response) => {
    console.log("Bot is up and running.");
    res.send("The bot is up and running.");
});

const sendQr=(res: Response) => {
    fs.readFile("qr.txt", (err, last_qr) => {
        if (!err&&last_qr) {
            const page=`
                        <html>
                            <body>
                                <script type="module">
                                </script>
                                <div id="qrcode"></div>
                                <script type="module">
                                    import QrCreator from "https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.es6.min.js";
                                    let container = document.getElementById("qrcode");
                                    QrCreator.render({
                                        text: "${last_qr}",
                                        radius: 0.5, // 0.0 to 0.5
                                        ecLevel: "H", // L, M, Q, H
                                        fill: "#536DFE", // foreground color
                                        background: null, // color or null for transparent
                                        size: 256, // in pixels
                                    }, container);
                                </script>
                            </body>
                        </html>
                    `;
            res.send(page);
        } else {
            console.log("Error reading qr.txt file.", err);
            console.log("Last Qr", last_qr);
        }
    });
}

app.get("/qr", (req: Request, res: Response) => {
    client
        .getState()
        .then((data) => {
            if (data) {
                res.send("Already Authenticated");
            } else sendQr(res);
        })
        .catch(() => sendQr(res));
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

client.initialize();
