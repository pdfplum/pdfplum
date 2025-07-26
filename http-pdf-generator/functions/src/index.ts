import "module-alias/register";
import * as admin from "firebase-admin";

admin.initializeApp();

import * as functions from "firebase-functions";
import { ParamsDictionary } from "express-serve-static-core";
import { parseParameters } from "./parse_parameters";
import { runAction } from "lib/utilities/action";
import { createErrorHandler } from "lib/utilities/error_handler";
import puppeteer from "puppeteer";

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

function getHtmlContent(parameters: any): string {
  const { dreamText, spiritual, psychological, overall, bonus1, bonus2, theme } = parameters;
  const themeStyles: Record<string, string> = {
    "aurora-bound": `
      body { font-family: 'Georgia', serif; background: #fefcf9; color: #2e2e2e; padding: 30px; }
      h1 { color: #6a4e77; }
      h2 { color: #3a3a3a; border-bottom: 1px solid #ccc; }
    `,
    "clean-clarity": `
      body { font-family: 'Arial', sans-serif; background: #ffffff; color: #000000; padding: 30px; }
      h1 { color: #00557f; }
      h2 { color: #444; border-bottom: 2px solid #eee; }
    `,
    "obsidian-glyph": `
      body { font-family: 'Times New Roman', serif; background: #1a1a1a; color: #f4f4f4; padding: 30px; }
      h1 { color: #e6e6e6; }
      h2 { color: #cccccc; border-bottom: 1px solid #444; }
    `,
    "cloudscript": `
      body { font-family: 'Cursive', sans-serif; background: #fdf6f8; color: #4d2d38; padding: 30px; }
      h1 { color: #e07a8f; }
      h2 { color: #9e4a59; border-bottom: 1px dashed #e6a8b4; }
    `,
    "lunar-veil": `
      body { font-family: 'Helvetica Neue', sans-serif; background: #f9f9f9; color: #333333; padding: 30px; }
      h1 { color: #7b7094; }
      h2 { color: #5a5a5a; border-bottom: 1px dotted #ccc; }
    `,
  };

  const appliedTheme = themeStyles[theme] || themeStyles["aurora-bound"];

  return `
    <html>
      <head><style>${appliedTheme}</style></head>
      <body>
        <h1>Your Dream Interpretation</h1>
        <h2>Your Dream</h2>
        <p>${dreamText}</p>
        <h2>Spiritual Significance</h2>
        <p>${spiritual}</p>
        <h2>Psychological Significance</h2>
        <p>${psychological}</p>
        <h2>Overall Interpretation</h2>
        <p>${overall}</p>
        ${bonus1 ? `<h2>Bonus Insight 1</h2><p>${bonus1}</p>` : ""}
        ${bonus2 ? `<h2>Bonus Insight 2</h2><p>${bonus2}</p>` : ""}
      </body>
    </html>
  `;
}

exports.executePdfGenerator = functions.https.onRequest(
  async (request: functions.Request<ParamsDictionary>, response) => {
    const errorHandler = createErrorHandler({
      response,
      context: {
        method: request.method,
        body: request.body,
        query: request.query,
      },
    });

    if (request.method !== "POST") {
      errorHandler(new Error("Only POST requests are supported."));
      return;
    }

    if (request.headers["content-type"] !== "application/json") {
      errorHandler(new Error("Only JSON requests are supported."));
      return;
    }

    try {
      process.on("uncaughtException", errorHandler);
      const postParameters = request.body;
      const parameters = runAction(parseParameters, {
        postParameters: postParameters,
      });

      functions.logger.info("Parameters", parameters);

      const htmlContent = getHtmlContent(parameters);
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({ format: "A4" });
      await browser.close();

      if (parameters.returnPdfInResponse) {
        response.setHeader(
          "content-type",
          `application/pdf; filename="${parameters.outputFileName}"`
        );
        response.setHeader(
          "content-disposition",
          `inline; filename="${parameters.outputFileName}"`
        );
        response.end(pdf);
      } else {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ done: "successful" }));
      }
    } catch (error) {
      functions.logger.error("Error", error);
      if (error instanceof Error) {
        errorHandler(error);
      }
    } finally {
      process.removeListener("uncaughtException", errorHandler);
    }
  }
);
