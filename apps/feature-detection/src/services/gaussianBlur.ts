// Utility to generate a Gaussian kernel
function generateGaussianKernel(size: number, sigma: number): number[][] {
  const kernel: number[][] = [];
  const mean = Math.floor(size / 2);
  let sum = 0;

  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const dx = x - mean;
      const dy = y - mean;
      // Gaussian formula: e^(-(x²+y²)/(2*sigma²)) / (2*PI*sigma²)
      const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      kernel[y][x] = value;
      sum += value;
    }
  }

  // Normalize the kernel
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }

  return kernel;
}

// Convolution function
function convolve(input: Buffer, width: number, height: number, kernel: number[][]): Buffer {
  const output = Buffer.alloc(input.length);
  const kSize = kernel.length;
  const kHalf = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      
      for (let ky = -kHalf; ky <= kHalf; ky++) {
        for (let kx = -kHalf; kx <= kHalf; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const pixel = input[py * width + px];
          const weight = kernel[ky + kHalf][kx + kHalf];
          sum += pixel * weight;
        }
      }
      
      output[y * width + x] = Math.min(Math.max(Math.round(sum), 0), 255);
    }
  }

  return output;
}

// Exported blur function
export function applyGaussianBlur(input: Buffer, width: number, height: number): Buffer {
  const kernel = generateGaussianKernel(5, 1.0); // 5x5 kernel, sigma = 1.0
  return convolve(input, width, height, kernel);
}
