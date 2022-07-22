import * as puppeteer from "puppeteer";

// eslint-disable-next-line require-jsdoc
export async function renderPdf({
  portNumber,
}: {
  portNumber: number;
}): Promise<Buffer> {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  page.setDefaultNavigationTimeout(0);

  await page.goto(`http://localhost:${portNumber}`, {
    waitUntil: "networkidle0",
    timeout: 0,
  });

  await page.content();

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    timeout: 0,
  });

  return pdf;
}
