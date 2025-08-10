import puppeteerCore, { PDFOptions, Browser } from "puppeteer-core";
import * as functions from "firebase-functions";

/**
 * Opens a Chromium page, opens the content served on `portNumber`, generates
 * a PDF file out of it and returns it.
 */
export async function renderPdf({
  adjustHeightToFit,
  chromiumPdfOptions,
  headless,
  portNumber,
  networkIdleTime,
  shouldWaitForIsReady,
}: {
  adjustHeightToFit: boolean;
  chromiumPdfOptions: PDFOptions;
  headless: boolean;
  portNumber: number;
  networkIdleTime: number;
  shouldWaitForIsReady: boolean;
}): Promise<Buffer> {
  // if (headless === true) {
  //   chromiumArguments.push("--single-process");
  // } else {
  //   chromiumArguments.push("--start-maximized");
  // }

  let browser: Browser;
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    const puppeteer = await import("puppeteer");
    browser = await puppeteerCore.launch({
      executablePath: puppeteer.executablePath(),
    });
  } else {
    const chromium = (await import("@sparticuz/chromium")).default;
    browser = await puppeteerCore.launch({
      ignoreHTTPSErrors: true,
      args: chromium.args,
      executablePath: await chromium.executablePath(),
    });
  }
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
      },
    ),
  );
  page.on("error", (error) => {
    functions.logger.info(
      "Error raised while loading template bundle in the browser",
      {
        errorMessage: error.message,
        stack: error.stack,
      },
    );
  });
  page.on("pageerror", (error) => {
    functions.logger.info(
      "Error raised while loading template bundle in the browser",
      {
        errorMessage: error.message,
        stack: error.stack,
      },
    );
  });
  page.on("requestfailed", (request): void => {
    functions.logger.info(
      `Request failed while loading template bundle in the browser (${request.url()})`,
      { request, error: request.failure()?.errorText },
    );
  });

  await page.goto(`http://localhost:${portNumber}`, {
    timeout: 0,
    ...(headless ? { waitUntil: "networkidle0" } : {}),
  });

  await page.waitForNetworkIdle({ idleTime: networkIdleTime, timeout: 0 });

  if (shouldWaitForIsReady) {
    const watchDog = page.waitForFunction("window.isReady === true");
    await watchDog;
  }

  await page.content();

  const extraOptions: PDFOptions = {};

  if (adjustHeightToFit) {
    if (chromiumPdfOptions.width != null) {
      await page.evaluate(
        "document.documentElement.style.width = " + chromiumPdfOptions.width,
      );
    }

    await page.addStyleTag({ content: "html, body {height: fit-content;}" });

    await page.content();
    extraOptions.height = (await page.evaluate(
      "document.documentElement.offsetHeight",
    )) as number;

    extraOptions["pageRanges"] = "1";
  }

  const pdf = await page.pdf({
    timeout: 0,
    ...chromiumPdfOptions,
    ...extraOptions,
  });

  if (headless) {
    await page.close();
  }

  return pdf;
}
