import {Express} from "express";
import ImageController from "../controller/ImageController";

const apiV1 = `/api/v1/`;


export default (app: Express) => {

    app.use(`${apiV1}`, ImageController.router);

};

