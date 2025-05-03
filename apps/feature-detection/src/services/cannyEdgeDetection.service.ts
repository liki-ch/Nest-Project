import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { EventPattern } from '@nestjs/microservices';
import { convertToGreyscale } from '../../../common/utils/greyscale';
import { applyGaussianBlur } from './gaussianBlur';
import { computeSobelGradients } from './sobelGradients';
import { nonMaxSuppression } from './nonMaxSuppression';
import { doubleThreshold } from './doubleThreshold';
import { hysteresis } from './hysteresis';


@Injectable()
export class CannyEdgeDetectionService {
  @EventPattern({ cmd: 'canny_edge_detection_image' })
  async detectEdges(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) throw new Error('File does not exist');

      const outputDir = path.join(process.cwd(), 'apps/feature-detection/output_images');
      const outputFileName = 'canny_edges.png';
      const outputFilePath = path.join(outputDir, outputFileName);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      // Convert to greyscale
      const { buffer: gray, width, height } = await convertToGreyscale(imagePath);

      // Apply gaussian blur (missing step)
      const blurred = applyGaussianBlur(gray, width!, height!);

      // Calculate gradients
      const { magnitude, direction } = computeSobelGradients(blurred, width!, height!);

      // Non-Max Suppression
      const thinEdges = nonMaxSuppression(magnitude, direction, width!, height!);

      // Better threshold values for cleaner edge detection
      const { strongEdges, weakEdges } = doubleThreshold(thinEdges, width!, height!, 15, 30);

      // Apply hysteresis (missing step)
      const edges = hysteresis(strongEdges, weakEdges, width!, height!);

      // Save the final output
      await sharp(edges, {
        raw: { width: width!, height: height!, channels: 1 },
      }).png().toFile(outputFilePath);

      return {
        success: true,
        message: 'Canny edge detection complete',
        savedImagePath: outputFilePath,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
