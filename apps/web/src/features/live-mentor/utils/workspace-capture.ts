"use client";

export async function captureWorkspaceImage(
  element: HTMLElement | null,
): Promise<string | null> {
  if (!element) {
    return null;
  }

  try {
    const { toJpeg } = await import("html-to-image");
    const dataUrl = await toJpeg(element, {
      backgroundColor: "#08101a",
      cacheBust: true,
      pixelRatio: 1,
      quality: 0.92,
      skipFonts: true,
    });

    const [, base64] = dataUrl.split(",", 2);
    return base64 ?? null;
  } catch {
    return null;
  }
}
