import chromium from "chrome-aws-lambda";
import { PDFOptions } from "puppeteer-core";

/**
 * Opens a Chromium page, opens the content served on `portNumber`, generates
 * a pdf out of it and returns it
 */
export async function renderPdf({
  adjustHeightToFit,
  chromiumPdfOptions,
  headless,
  portNumber,
  shouldWaitForIsReady,
}: {
  adjustHeightToFit: boolean;
  chromiumPdfOptions: PDFOptions;
  headless: boolean;
  portNumber: number;
  shouldWaitForIsReady: boolean;
}): Promise<Buffer> {
  const browser = await chromium.puppeteer.launch({
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    ignoreHTTPSErrors: true,
    headless,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);

  await page.goto(`http://localhost:${portNumber}`, {
    timeout: 0,
    ...(headless ? { waitUntil: "networkidle0" } : {}),
  });

  if (shouldWaitForIsReady) {
    const watchDog = page.waitForFunction("window.isReady === true");
    await watchDog;
  }

  await page.content();

  const extraOptions: PDFOptions = {};

  if (adjustHeightToFit) {
    if (chromiumPdfOptions.width != null) {
      await page.evaluate(
        "document.documentElement.style.width = " + chromiumPdfOptions.width
      );
    }

    await page.addStyleTag({ content: "html, body {height: fit-content;}" });

    await page.content();
    extraOptions.height = (await page.evaluate(
      "document.documentElement.offsetHeight"
    )) as number;

    extraOptions["pageRanges"] = "1";
  }

  const pdf = await page.pdf({
    timeout: 0,
    ...chromiumPdfOptions,
    ...extraOptions,
  });

  await page.close();

  return pdf;
}
