export function hysteresis(strong: Uint8Array, weak: Uint8Array, width: number, height: number): Buffer {
  const result = Buffer.from(strong);

  const isStrong = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = y * width + x;
    return result[idx] === 255;
  };

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (weak[idx] === 255) {
        if (
          isStrong(x + 1, y) || isStrong(x - 1, y) || 
          isStrong(x, y + 1) || isStrong(x, y - 1) ||
          isStrong(x + 1, y + 1) || isStrong(x - 1, y - 1) ||
          isStrong(x + 1, y - 1) || isStrong(x - 1, y + 1)
        ) {
          result[idx] = 255;
        }
      }
    }
  }

  return result;
}