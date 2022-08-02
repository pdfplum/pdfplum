import chromium from "chrome-aws-lambda";

/**
 * Opens a Chromium page, opens the content served on `portNumber`, generates
 * a pdf out of it and returns it
 */
export async function renderPdf({
  portNumber,
}: {
  portNumber: number;
}): Promise<Buffer> {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);

  await page.goto(`http://localhost:${portNumber}`, {
    waitUntil: "networkidle0",
    timeout: 0,
  });

  await page.content();

  const pdf = await page.pdf({
    format: "a4",
    printBackground: true,
    timeout: 0,
  });

  return pdf;
}
