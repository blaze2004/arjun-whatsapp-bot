import { Router, Request, Response } from "express";
import fs from "fs";
import { client } from "..";

const router=Router();

router.get("/", (_: Request, res: Response) => {
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
        }
    });
}

router.get("/qr", (_: Request, res: Response) => {
    client
        .getState()
        .then((data) => {
            if (data) {
                res.send("Already Authenticated");
            } else sendQr(res);
        })
        .catch(() => sendQr(res));
});

export default router;