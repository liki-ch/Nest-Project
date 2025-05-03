import * as sharp from 'sharp';

export async function convertToGreyscale(imagePath: string): Promise<{ buffer: Buffer, width: number, height: number }> {
  const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels = 3 } = info;
  
  const greyscaleBuffer = Buffer.alloc(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const y_val = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      greyscaleBuffer[y * width + x] = y_val;
    }
  }

  return {
    buffer: greyscaleBuffer,
    width: width,
    height: height
  };
}