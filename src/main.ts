import sharp = require("sharp");
import { createCanvas } from "canvas";
import puppeteer from "puppeteer";
import path = require("path");

const WEBSITE_URL = "https://www.wikipedia.org/"; // "https://devchallenges-rwd-7.onrender.com";;
const TITLE_TEXT = "WIKIPEDIA HOME PAGE"; //
const SUB_TITLE_TEXT = "created by Dexter Labs Inc.";
async function takeScreenshots(url: string) {
  3;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const viewports = [
    { width: 450, height: 800 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1080 },
  ];

  const screenshots = [];

  for (const { width, height } of viewports) {
    await page.setViewport({ width, height });

    const filename = `screenshot-${width}x${height}.png`;
    const finalPath = path.join(__dirname, "screenshots", filename);

    const screenshotBuffer = await page.screenshot({
      path: finalPath,
      fullPage: true,
    });

    screenshots.push(screenshotBuffer);
  }

  await browser.close();
  return screenshots;
}

async function createTwitterImage() {
  const screenshots = (await takeScreenshots(WEBSITE_URL)).slice(0, 2);

  const baseImage = await sharp("new_base.png").toBuffer();

  const imagePromises = screenshots.map(async (screenshot) => {
    const { width } = await sharp(screenshot).metadata();
    let resizeWidth;
    let resizeHeight = 664;

    if (width === 1920) {
      resizeWidth = 900;
    } else {
      resizeWidth = 420;
    }

    const resizedScreenshotBuffer = await sharp(screenshot)
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
  const imageComposites = images.map((image, index) => ({
    input: image.buffer,
    top: 236,
    left: index === 0 ? 100 : 600,
  }));

  const canvas = createCanvas(776, 63);
  const ctx = canvas.getContext("2d");

  const textColor = "#000";
  ctx.font = `bold 3rem Helvetica`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = "hanging";
  ctx.fillText(TITLE_TEXT, 0, 0);

  // Convert the canvas to a buffer
  const buffer = canvas.toBuffer();

  const composites = [
    ...imageComposites,
    { input: buffer, top: 84, left: 432 },
  ];

  const twitterImage = await sharp(baseImage)
    .composite(composites)
    .toFile("twitter.png");

  console.log("Twitter image created successfully.");
}

createTwitterImage();
