import app from "./app";
import http from "http";
import {Express} from "express";
import * as dotenv from "dotenv";
dotenv.config();
import {errorHandler} from "./utils/helper/api-handler";
import pg from "./connection/postgres"



const router: Express = app;
const PORT = process.env.PORT || 8001


router.get("/", function (req, res) {
    res.status(200).send(`App listening on Port: ${PORT}`);
});


/** Error handling */
router.use(errorHandler);

/** Server */
const httpServer = http.createServer(router);
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`))