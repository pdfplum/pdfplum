import * as functions from "firebase-functions";
import puppeteer, { PDFOptions } from "puppeteer";

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
  const chromiumArguments = [
    "--allow-running-insecure-content",
    "--autoplay-policy=user-gesture-required",
    "--disable-component-update",
    "--disable-domain-reliability",
    "--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process",
    "--disable-print-preview",
    "--disable-setuid-sandbox",
    "--disable-site-isolation-trials",
    "--disable-speech-api",
    "--disable-web-security",
    "--disk-cache-size=33554432",
    "--enable-features=SharedArrayBuffer",
    "--hide-scrollbars",
    "--ignore-gpu-blocklist",
    "--in-process-gpu",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-pings",
    "--no-sandbox",
    "--no-zygote",
    "--use-gl=swiftshader",
    "--window-size=1920,1080",
  ];

  if (headless === true) {
    chromiumArguments.push("--single-process");
  } else {
    chromiumArguments.push("--start-maximized");
  }

  const browser = await puppeteer.launch({
    defaultViewport: {
      deviceScaleFactor: 1,
      hasTouch: false,
      height: 1080,
      isLandscape: true,
      isMobile: false,
      width: 1920,
    },
    ignoreHTTPSErrors: true,
    headless,
    args: chromiumArguments,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);

  page.on("console", (message) =>
    functions.logger.info(
      "Message logged while loading template bundle in the browser",
      {
        type: message.type(),
        args: message.args(),
        stackTrace: message.stackTrace(),
        location: message.location(),
        text: message.text(),
      }
    )
  );
  page.on("pageerror", (error) => {
    functions.logger.info(
      "Error raised while loading template bundle in the browser",
      {
        errorMessage: error.message,
        stack: error.stack,
      }
    );
  });
  page.on("requestfailed", (request): void => {
    functions.logger.info(
      `Request failed while loading template bundle in the browser (${request.url()})`,
      { request, error: request.failure()?.errorText }
    );
  });

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
