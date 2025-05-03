/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResizeService {
  @MessagePattern({ cmd: 'resize_image' })
  async resize(data: { imagePath: string; width: number; height: number }) {
    try {
      const { imagePath, width, height } = data;

      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFileName = 'resized_image.png';
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const inputImage = await fs.promises.readFile(imagePath);
      const { data: inputBuffer, info: inputInfo } = await sharp(inputImage).raw().toBuffer({ resolveWithObject: true });

      // Fix: Pass channels from the input info
      const resizedBuffer = this.bilinearInterpolation(
        inputBuffer, 
        inputInfo.width, 
        inputInfo.height, 
        width, 
        height,
        inputInfo.channels
      );

      // Save the resized image
      await sharp(resizedBuffer, {
        raw: {
          width: width,
          height: height,
          channels: inputInfo.channels,
        },
      })
        .png()
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Image resized successfully',
        savedImagePath: outputFilePath,
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private bilinearInterpolation(
    inputBuffer: Buffer,
    inputWidth: number,
    inputHeight: number,
    outputWidth: number,
    outputHeight: number,
    channels: number // Add channels parameter
  ): Buffer {
    const outputBuffer = Buffer.alloc(outputWidth * outputHeight * channels);
    
    // FIX: Added bilinear interpolation implementation
    const x_ratio = (inputWidth - 1) / (outputWidth - 1);
    const y_ratio = (inputHeight - 1) / (outputHeight - 1);
    
    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        const x_l = Math.floor(x * x_ratio);
        const y_l = Math.floor(y * y_ratio);
        
        const x_h = Math.min(x_l + 1, inputWidth - 1);
        const y_h = Math.min(y_l + 1, inputHeight - 1);
        
        const x_weight = (x * x_ratio) - x_l;
        const y_weight = (y * y_ratio) - y_l;
        
        for (let c = 0; c < channels; c++) {
          const tl = inputBuffer[(y_l * inputWidth + x_l) * channels + c];
          const tr = inputBuffer[(y_l * inputWidth + x_h) * channels + c];
          const bl = inputBuffer[(y_h * inputWidth + x_l) * channels + c];
          const br = inputBuffer[(y_h * inputWidth + x_h) * channels + c];
          
          const top = tl * (1 - x_weight) + tr * x_weight;
          const bottom = bl * (1 - x_weight) + br * x_weight;
          
          outputBuffer[(y * outputWidth + x) * channels + c] = Math.round(top * (1 - y_weight) + bottom * y_weight);
        }
      }
    }
    
    return outputBuffer;
  }
}