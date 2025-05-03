export function nonMaxSuppression(
  magnitude: Float32Array,
  direction: Float32Array,
  width: number,
  height: number
): Float32Array {
  const output = new Float32Array(width * height);

  const angleDeg = new Float32Array(direction.length);
  for (let i = 0; i < direction.length; i++) {
    angleDeg[i] = ((direction[i] * 180) / Math.PI + 180) % 180; // Normalize to [0, 180)
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const angle = angleDeg[idx];
      const mag = magnitude[idx];

      let neighbor1 = 0;
      let neighbor2 = 0;

      // Angle 0 or 180 degrees - horizontal direction
      if ((0 <= angle && angle < 22.5) || (157.5 <= angle && angle <= 180)) {
        neighbor1 = magnitude[y * width + (x + 1)];
        neighbor2 = magnitude[y * width + (x - 1)];
      }
      // Angle 45 degrees - diagonal top-right to bottom-left
      else if (22.5 <= angle && angle < 67.5) {
        neighbor1 = magnitude[(y - 1) * width + (x + 1)];
        neighbor2 = magnitude[(y + 1) * width + (x - 1)];
      }
      // Angle 90 degrees - vertical direction
      else if (67.5 <= angle && angle < 112.5) {
        neighbor1 = magnitude[(y - 1) * width + x];
        neighbor2 = magnitude[(y + 1) * width + x];
      }
      // Angle 135 degrees - diagonal top-left to bottom-right
      else if (112.5 <= angle && angle < 157.5) {
        neighbor1 = magnitude[(y - 1) * width + (x - 1)];
        neighbor2 = magnitude[(y + 1) * width + (x + 1)];
      }

      // Apply non-max suppression
      if (mag >= neighbor1 && mag >= neighbor2) {
        output[idx] = mag;
      } else {
        output[idx] = 0;
      }
    }
  }

  return output;
}
