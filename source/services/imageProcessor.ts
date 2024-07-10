import axios from 'axios';
import sharp from 'sharp';
import image from "../module/image"
import logger from '../utils/logger';

export const processImages = async (data: any[], requestId: string) => {
    try {
      for (const item of data) {
        const inputUrls = item['Input Image Urls'].split(',');
  
        const outputUrls: string[] = [];
  
        for (const url of inputUrls) {
          const response = await axios({
            url: url.trim(),
            responseType: 'arraybuffer',
          });
  
          const imageBuffer = Buffer.from(response.data, 'binary');
  
          const compressedImage = await sharp(imageBuffer)
            .jpeg({ quality: 50 })
            .toBuffer();
  
          const outputUrl = `https://example.com/compressed/${Date.now()}.jpg`;
          outputUrls.push(outputUrl);
  
        }
  
        // Save product info and URLs to the database
        await image.saveProduct({
          requestId,
          serialNumber: item['Serial Number'],
          productName: item['Product Name'],
          inputImageUrls: inputUrls,
          outputImageUrls: outputUrls
        });
      }
  
      await image.updateRequestStatus(requestId, 'completed');

      const getWebhookUrl = await image.getWebhookUrl(requestId);
      const webhookUrl = getWebhookUrl.rows[0].webhook_url;
      if(webhookUrl) {
        await axios.post(webhookUrl, {
          requestId,
          status: 'completed',
        });
      }
    } catch (error) {
      console.error('Error processing images', error);
      await image.updateRequestStatus(requestId, 'failed');
      logger.error(error)
    }
  };