import { Command } from "commander";
import createOpenGraphImage from "./utils/og_image_generator";
const program = new Command();

program
  .name("tp-cli")
  .description("CLI to create twitter post from URL")
  .version("0.0.1");

program
  .option("-u, --url <URL>", "URL of the website")
  .option("-t, --title <title>", "Main heading")
  .option("-a, --author <author>", "name of the author")
  .option("-b, --base-image <path>", "path to base imag")
  .option(
    "-o, --out-dir <outPath>",
    "path where output files should be placed"
  );

program
  .command("gen")
  .description("generate images from cli")
  .action(async () => {
    console.log(`starting Image generation`);
    const { url, title, author, baseImage, outDir } = program.opts();
    await createOpenGraphImage({
      title: title,
      url: url,
      outputPath: outDir,
      baseImage,
    });
  });

program.parse(process.argv);
