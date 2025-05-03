export function applyConvolution(
    imageData: Buffer,
    width: number,
    height: number,
    channels: number,
    kernel: number[][]
): Buffer {
    const result = Buffer.alloc(imageData.length);
    const kernelSize = kernel.length;
    const kernelHalf = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let c = 0; c < channels; c++) {
                const pixelIndex = (y * width + x) * channels + c;
                
                let sum = 0;
                
                // Apply the kernel
                for (let ky = -kernelHalf; ky <= kernelHalf; ky++) {
                    for (let kx = -kernelHalf; kx <= kernelHalf; kx++) {
                        const px = Math.min(Math.max(x + kx, 0), width - 1);
                        const py = Math.min(Math.max(y + ky, 0), height - 1);
                        
                        const sourceIdx = (py * width + px) * channels + c;
                        const kernelVal = kernel[ky + kernelHalf][kx + kernelHalf];
                        
                        sum += imageData[sourceIdx] * kernelVal;
                    }
                }
                
                result[pixelIndex] = Math.min(Math.max(Math.round(sum), 0), 255);
            }
        }
    }
    
    return result;
}
