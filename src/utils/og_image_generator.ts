import { createCanvas } from "canvas";
import path from "path";
import sharp from "sharp";
import takeScreenshots from "./screenshots";

const TITLE_TEXT = "Wikipedia Encyclopedia";
const WEBSITE_URL = "https://www.wikipedia.org/"; // "https://devchallenges-rwd-1.onrender.com";
const OUT_DIR = "output";
const VIEW_PORTS = [
  { width: 450, height: 800 },
  { width: 1920, height: 1080 },
  // { width: 2560, height: 1080 },
];
const DEFAULT_BASE_IMG_PATH = `base.png`;

async function createOpenGraphImage({
  title = TITLE_TEXT,
  outputPath = OUT_DIR,
  url = WEBSITE_URL,
  baseImage = DEFAULT_BASE_IMG_PATH,
}: {
  title: string;
  outputPath: string;
  url: string;
  baseImage: string;
}) {
  const outDirPath = path.join(__dirname, outputPath);

  const screenshotsBuffers: Buffer[] = (
    await takeScreenshots({ url, outputPath, viewPorts: VIEW_PORTS })
  ).slice(0, 2);

  // reading the base image
  const baseImgBuffer = await sharp(baseImage).toBuffer();

  const imagePromises = screenshotsBuffers.map(async (screenshotBuffer) => {
    const img = sharp(screenshotBuffer);

    const { width } = await img.metadata();
    let resizeWidth;
    let resizeHeight = 664;

    if (width === 1920) {
      resizeWidth = 900;
    } else {
      resizeWidth = 420;
    }

    console.log(`resizing image from width: ${width} to ${resizeWidth}`);
    const resizedScreenshotBuffer = await img
      .resize({
        width: resizeWidth,
        height: resizeHeight,
        fit: sharp.fit.cover,
        position: "top",
      })
      .toBuffer();

    return { buffer: resizedScreenshotBuffer, width: resizeWidth };
  });

  const images = await Promise.all(imagePromises);

  // creating image composites
  const imageComposites = images.map((image, index) => ({
    input: image.buffer,
    top: 236,
    left: index === 0 ? 100 : 600,
  }));

  const textBuffer = createTextBuffer(title);
  const composites = [
    ...imageComposites,
    { input: textBuffer, top: 84, left: 432 },
  ];

  const twitterPost = sharp(baseImgBuffer).composite(composites);

  await twitterPost.toFile(path.join(outDirPath, "twitter_post.png"));
  console.log("Twitter Post image created successfully.");

  await sharp(await twitterPost.toBuffer())
    .resize({ width: 1200, height: 630, fit: sharp.fit.cover, position: "top" })
    .toFile(path.join(outDirPath, "og.png"));
  console.log("OG:IMG open grapht image created successfully.");
}

const createTextBuffer = (text: string) => {
  const canvas = createCanvas(776, 63);
  const ctx = canvas.getContext("2d");

  const textColor = "#000";
  ctx.font = `bold 3rem Helvetica`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = "hanging";
  ctx.fillText(text, 0, 0);

  // Convert the canvas to a buffer
  return canvas.toBuffer();
};

export default createOpenGraphImage;
