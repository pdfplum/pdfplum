Use this extension to generate PDF files with Handlebars, Puppeteer, and HTML. To use PDFPlum, follow these steps:

- Create a template using HTML and Handlebars.
- Package the resources into a ZIP file.
- Upload the ZIP file to a Google Cloud Storage bucket.

This extension listens for Firestore document-creation events, which will trigger the extension.

Upon triggering, the extension downloads the template, runs Handlebars on it using data from the Firestore document, and converts it into a PDF. The generated PDF file is then stored in a Firebase Storage bucket.

## Demo

For inspiration, check out the pre-made templates and their outputs in the [template-samples/](https://github.com/pdfplum/pdfplum/tree/main/template-samples) directory. Each includes HTML files and their resources. To use any of these templates in your extension, upload the `.zip` file to a Storage bucket and include the complete file path in the `TEMPLATE_PATH` extension parameter.

## Preparation

Before installing this extension, you need to:

- Create a template as described [here](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PREINSTALL.md#the-template).
- [Set up Firebase Storage in your Firebase project.](https://firebase.google.com/docs/storage)
- Upload the template file (the zipped directory) to a Firebase Storage bucket.

Templates in this extension are based on Handlebars and can be configured using the features provided by Handlebars.

The printing mechanism is powered by [Puppeteer](https://pptr.dev/) which uses Chromium's PDF rendering engine.

## Why Puppeteer?

After testing various free PDF generation tools, including Google Docs API, Pandoc, makepdf, and others, Puppeteer was found to be the best for running in Cloud Functions and supporting easy templating with Handlebars. All other tools had limitations that prevented a complete end-to-end PDF templating solution. Third-party PDF APIs could be alternatives, but this extension aims to provide a free and straightforward solution.

## Usage

### The template

The template bundle is a ZIP file containing an `index.html` file. The bundle can optionally include media, fonts, CSS files, and more. The `index.html` file can access all files in the bundle, assuming they are served at the root (`/`).

For example, `images/flower.png` in the ZIP file will be served at `/images/flower.png`. The `index.html` file can also access online resources, such as loading a font, script, or CSS file from CDNs.

### Firestore

When a document is created in `FIRESTORE_COLLECTION`, the extension generates a PDF based on the template file and the content of the created document.

## How it all works

The template bundle is uncompressed, served, and loaded by a Chromium instance. Handlebars runs on all `.html`, `.txt`, and `.md` files, replacing their template placeholders with data from the GET parameter `data`. After all network resources are fully loaded, a PDF file is generated from the rendered webpage.

The generated PDF file is saved in the bucket specified in the [`OUTPUT_STORAGE_BUCKET`](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PREINSTALL.md#outputstoragebucket-optional) extension parameter.

The PDF file is named according to the rules described [here](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PREINSTALL.md#outputfilename).

## Billing

To install an extension, your project must be on the [Blaze (pay as you go) plan](https://firebase.google.com/pricing)

- This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
  - Cloud Firestore
  - Cloud Functions (Node.js 10+ runtime. [See FAQs](https://firebase.google.com/support/faq#extensions-pricing))
  - Cloud Storage
