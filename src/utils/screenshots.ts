import fs from "fs";
import path from "path";

import puppeteer from "puppeteer";

async function takeScreenshots({
  url,
  outputPath,
  viewPorts,
}: {
  url: string;
  outputPath: string;
  viewPorts: {
    width: number;
    height: number;
  }[];
}): Promise<Buffer[]> {
  const outDirPath = path.join(__dirname, outputPath);

  fs.mkdir(outDirPath, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log(`create output directory: ${outDirPath}`);
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // waiting for the network requests to stop
  console.log(`Loading the URL to browser: ${url}`);
  await page.goto(url, { waitUntil: "networkidle0" });

  console.log(`Starting to take screenshots`);
  const screenshots = [];

  for (const { width, height } of viewPorts) {
    await page.setViewport({ width, height });

    let filename = ``;

    switch (width) {
      case 450:
        filename = `demo-mobile.png`;
        break;
      case 1920:
        filename = `demo-desktop.png`;
        break;

      default:
        filename = `screenshot-${width}x${height}.png`;
        break;
    }

    let finalPath = path.join(outDirPath, filename);

    const screenshotBuffer = await page.screenshot({
      path: finalPath,
      fullPage: true,
    });

    console.log(
      `Screenshot of viewport{${width}x${height}} is saved to: ${outDirPath}`
    );
    screenshots.push(screenshotBuffer);
  }

  await browser.close();
  console.log(`Closing browser, all screenshots have been saved.`);

  return screenshots;
}

export default takeScreenshots;
