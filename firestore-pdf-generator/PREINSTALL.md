# Pre-installation

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

- Create a template as described [here](#the-template).
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

The generated PDF file is saved in the bucket specified in the [`OUTPUT_STORAGE_BUCKET`](#outputstoragebucket-optional) extension parameter.

The PDF file is named according to the rules described [here](#outputfilename).

### Firebase extension parameters

#### `SHOULD_MAKE_PDF_PUBLIC` (required)

Determines if the generated PDF in the output storage bucket should be public or private.<br/>
type: **select**

Whether the generated PDF file should be public or private.

#### `TEMPLATE_PATH` (required)

Template path<br/>
type: **string**

The path of the zip file containing the template files stored in a Firebase Storage bucket. Can be overridden by GET parameters.

#### `ADJUST_HEIGHT_TO_FIT` (required)

Should PDFPlum automatically set the document height to fit its content?<br/>
type: **select**

If enabled, the extension will automatically adjust the height of the PDF so that all the contents of the webpage can fit inside one page. The generated PDF file in this case will always have only a single page. Can be overridden by GET parameters.

#### `CHROMIUM_PDF_OPTIONS` (required)

Chromium PDF generation options<br/>
type: **string**

Options to be passed to Chromium's PDF generation engine provided as a JSON string. Documented [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html). Can be overridden by GET parameters.

#### `NETWORK_IDLE_TIME` (required)

Network idle time (in milliseconds)<br/>
type: **string**

The amount of time without any network activity before rendering the PDF file starts. This ensures all external resources are loaded and allows for a grace period.

#### `SHOULD_WAIT_FOR_IS_READY` (required)

Wait for `isReady`?<br/>
type: **select**

ndicates whether the extension should wait for the `window.isReady` variable to be set to `true` before rendering the PDF. Can be overridden by GET parameters.

#### `LOCATION` (required)

Cloud Functions' location<br/>
type: **select**

The location you want to deploy the functions created for this extension. You usually want a location close to your Storage bucket. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

#### `FUNCTION_MEMORY` (required)

Cloud Function memory<br/>
type: **select**

The memory allocated to the function responsible for creating the PDF. Choose how much memory to give to the function that creates the PDF file.

#### `FUNCTION_TIMEOUT` (required)

Cloud Function timeout (in seconds)<br/>
type: **string**

The time the function has to complete its task.

#### `OUTPUT_STORAGE_BUCKET` (required)

Output Firebase Storage bucket name<br/>
type: **string**

The name of the bucket where the output PDF file will be stored.

#### `FIRESTORE_COLLECTION` (required)

Firestore collection, its document creation events should be listened to<br/>
type: **string**

If specified, the extension will monitor creation events in this collection. When a new document is created in this collection, a PDF will be generated based on the document's values.
