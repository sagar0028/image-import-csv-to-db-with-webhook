import {Request, Response, Router} from "express";
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { processImages } from '../services/imageProcessor';
import image from "../module/image";

const upload = multer({ dest: 'uploads/' });


class ImageController {
    router = Router();

    constructor() {
        this.intializeRoutes();
    }

    private intializeRoutes() {
        this.router.post('/upload', upload.single('file'), this.uploadCsv);
        this.router.get('/status/:id', this.checkStatus);
    }

    private uploadCsv = async (req: Request, res: Response) => {
        const requestId = uuidv4();
        const file = req.file;
        const webhookUrl = req.body.webhookUrl;

        if (!file) {
          return res.status(400).send('No file uploaded.');
        }
      
        const filePath = file.path;
        const results: any[] = [];
      
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true }))
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            if (!results.every(row => row['Serial Number'] && row['Product Name'] && row['Input Image Urls'])) {
              return res.status(400).send('CSV file is incorrectly formatted.');
            }
      
            const saveStatus = await image.createStatus(requestId,webhookUrl);

            if(saveStatus.rowCount > 0){
                processImages(results, requestId);
                res.status(200).send({ requestId });
            }
          });
    };

    private  checkStatus = async (req: Request, res: Response) => {
        const requestId = req.params.id;
      
        const result = await image.getStatus(requestId)
        if (result.rows.length === 0) {
          return res.status(404).send('Request ID not found.');
        }
      
        res.status(200).send({ status: result.rows[0].status });
      };
}

export default new ImageController()