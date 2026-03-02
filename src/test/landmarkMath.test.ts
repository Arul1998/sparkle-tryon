import { describe, it, expect } from "vitest";
import { landmarkToPixel } from "@/lib/landmarkMath";

describe("landmarkToPixel", () => {
  it("returns direct mapping when video dims are zero", () => {
    const result = landmarkToPixel(0.5, 0.5, 800, 600, 0, 0, false);
    expect(result).toEqual({ px: 400, py: 300 });
  });

  it("maps center to center when aspect ratios match", () => {
    const result = landmarkToPixel(0.5, 0.5, 800, 600, 800, 600, false);
    expect(result.px).toBeCloseTo(400, 0);
    expect(result.py).toBeCloseTo(300, 0);
  });

  it("mirrors x-coordinate when mirrored is true", () => {
    const normal = landmarkToPixel(0.3, 0.5, 800, 600, 800, 600, false);
    const mirrored = landmarkToPixel(0.3, 0.5, 800, 600, 800, 600, true);
    // Mirrored should use (1 - 0.3) = 0.7 for x
    expect(mirrored.px).toBeCloseTo(800 - normal.px, 0);
  });

  it("handles wider video (cropped sides) correctly", () => {
    // Video 1920x1080 (16:9) in container 600x600 (1:1)
    // Video is wider, so scale = ch/vh = 600/1080
    const result = landmarkToPixel(0.5, 0.5, 600, 600, 1920, 1080, false);
    // scale = 600/1080 ≈ 0.5556
    // offsetX = (1920 * 0.5556 - 600) / 2 = (1066.67 - 600) / 2 = 233.33
    // px = 0.5 * 1920 * 0.5556 - 233.33 = 533.33 - 233.33 = 300
    expect(result.px).toBeCloseTo(300, 0);
    expect(result.py).toBeCloseTo(300, 0);
  });

  it("handles taller video (cropped top/bottom) correctly", () => {
    // Video 720x1280 (9:16) in container 800x600 (4:3)
    // Video is taller, so scale = cw/vw = 800/720
    const result = landmarkToPixel(0.5, 0.5, 800, 600, 720, 1280, false);
    // scale = 800/720 ≈ 1.1111
    // offsetY = (1280 * 1.1111 - 600) / 2 = (1422.22 - 600) / 2 = 411.11
    // py = 0.5 * 1280 * 1.1111 - 411.11 = 711.11 - 411.11 = 300
    expect(result.px).toBeCloseTo(400, 0);
    expect(result.py).toBeCloseTo(300, 0);
  });

  it("maps corners correctly", () => {
    const topLeft = landmarkToPixel(0, 0, 800, 600, 800, 600, false);
    expect(topLeft.px).toBeCloseTo(0, 0);
    expect(topLeft.py).toBeCloseTo(0, 0);

    const bottomRight = landmarkToPixel(1, 1, 800, 600, 800, 600, false);
    expect(bottomRight.px).toBeCloseTo(800, 0);
    expect(bottomRight.py).toBeCloseTo(600, 0);
  });
});
