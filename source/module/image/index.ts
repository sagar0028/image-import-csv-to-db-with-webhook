import pg from "../../connection/postgres";
import logger from "../../utils/logger";


interface ProductData {
    requestId: string;
    serialNumber: number;
    productName: string;
    inputImageUrls: string[];
    outputImageUrls: string[];
  }

class Image {
    getStatus = async ( requestId : string ) => {
        try {
            const query = {
                text: `SELECT status FROM requests WHERE id = $1`,
                values: [requestId]
            };
            const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };

    createStatus = async ( requestId : string, webhookUrl: string ) => {
        try {
            const query = {
                text: `INSERT INTO requests (id, status, webhook_url) VALUES ($1, $2, $3)`,
                values: [requestId,'processing', webhookUrl]
            };
            const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };


    
    saveProduct = async (productData: ProductData) => {
      try {
        const query = {
          text: `INSERT INTO products (request_id, serial_number, product_name, input_image_urls, output_image_urls) VALUES ($1, $2, $3, $4, $5)`,
          values: [
            productData.requestId,
            productData.serialNumber,
            productData.productName,
            productData.inputImageUrls.join(','),
            productData.outputImageUrls.join(',')
          ]
        };
        const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
    
    updateRequestStatus = async (requestId: string, status: string) => {
      try {
        const query = {
          text: `UPDATE requests SET status = $1 WHERE id = $2`,
          values: [status, requestId]
        };
        const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    
    }

    getWebhookUrl = async ( requestId : string) => {
        try {
            const query = {
                text: `SELECT webhook_url FROM requests WHERE id = $1`,
                values: [requestId]
            };
            const {rowCount, rows} = await pg.query(query);
            return {
                rowCount, rows,
            };
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
}

export default new Image();