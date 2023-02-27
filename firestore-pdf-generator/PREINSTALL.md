# Pre-installation

Use this extension to generate PDF files using Handlebars, Puppeteer, and HTML. PDFPlum requires you to do the following:

- Prepare the template using HTML and Handlebars.
- Package the resources into a ZIP file.
- Upload it to a Google Cloud Storage bucket.

This extension listens to Firestore document-creation events, which will trigger the extension.

It then downloads the template provided, runs Handlebars on it with the provided data coming from the Firestore document and converts it to PDF. The generated PDF file will be stored in a Firebase Storage bucket.

## Demo

For inspiration, there are some pre-made templates and their outputs prepared in the [template-samples/](https://github.com/pdfplum/pdfplum/tree/main/template-samples) directory. Each of them includes the HTMLs and their resources. The sample outputs can be found next to the template's `generated` directory. To use any of these in your extension config, just upload the `.zip` file to a Storage bucket and include the complete path of the file in `TEMPLATE_PATH` extension parameter.

## Preparation

Before installing this extension, you'll need to:

- Create a template as described [here](#the-template).
- [Set up Firebase Storage in your Firebase project.](https://firebase.google.com/docs/storage)
- Upload the template file (the zipped directory) to a Firebase Storage bucket.

The templates in this extension are based on Handlebars and can be configured via the means provided in Handlebars.

The printing mechanism is served by [Puppeteer](https://pptr.dev/) based on Chromium's PDF rendering engine.

## Why Puppeteer?

Based on testing done on different free PDF generation tools including Google Docs API, Pandoc, makepdf, and others, the best tool to run in Cloud Functions and support an easy way of templating via Handlebars was Puppeteer. All other tools had limitations which prevented a full end-to-end PDF templating solution. There are potential solutions using third-party PDF APIs but the goal of this extension was to support a free and simple solution.

## Usage

### The template

A ZIP file including an `index.html` file is the template bundle. The bundle can optionally include media, fonts, CSS files, etc. The `index.html` file can use all the files provided in the bundle, assuming they are being served in `/`.

For example, `images/flower.png` in the ZIP file will be served in `/images/flower.png`. The `index.html` file can also access resources on the internet, to load a font, a script, or a CSS file from CDNs, etc.

### Firestore

Whenever a document is created in [`FIRESTORE_COLLECTION`](#firestorecollection-optional), the extension will generate a PDF based on the template file and the content of the created document.

## How it all works

The template bundle will be uncompressed, served and loaded by a Chromium instance. Handlebars will run on all `.html`, `.txt`, and `.md` files to replace their template placeholders with data provided in the created document. After all network resources are completely loaded, a PDF file is generated from the rendered webpage.

The generated PDF file will be saved in the bucket specified in [`OUTPUT_STORAGE_BUCKET`](#outputstoragebucket-optional) extension parameter.

The PDF file will be named based on the rules described [here](#outputfilename).

### Firebase extension parameters

#### `SHOULD_MAKE_PDF_PUBLIC` (required)

Should the generated PDF in output storage bucket be public or private?<br/>
type: **select**

Whether the generated PDF file should be public or private.

#### `TEMPLATE_PATH` (required)

Template path<br/>
type: **string**

The path of the zip file containing the template files stored in a Firebase Storage bucket. Can be overridden by GET parameters.

#### `ADJUST_HEIGHT_TO_FIT` (required)

Should PDFPlum automatically set the document height to fit its content?<br/>
type: **select**

If set, it will automatically adjust the height of the PDF so that all the contents of the webpage can fit inside one page. The generated PDF file in this case will always have only a single page. Can be overridden by GET parameters.

#### `CHROMIUM_PDF_OPTIONS` (required)

Chromium PDF generation options<br/>
type: **string**

Options to be passed to Chromium PDF generation engine provided as a JSON string. Documented [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html). Can be overridden by GET parameters.

#### `NETWORK_IDLE_TIME` (required)

Network idle time (in milliseconds)<br/>
type: **string**

Amount of time without any network activity before rendering the PDF file starts. It is to make sure all external resources have been loaded and a grace time has been passed.

#### `SHOULD_WAIT_FOR_IS_READY` (required)

Wait for `isReady`?<br/>
type: **select**

Whether or not it should wait for `window.isReady` variable to be set to `true` before rendering the PDF. Can be overridden by GET parameters.

#### `LOCATION` (required)

Cloud Functions' location<br/>
type: **select**

The location you want to deploy the functions created for this extension. You usually want a location close to your Storage bucket. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

#### `FUNCTION_MEMORY` (required)

Cloud Function memory<br/>
type: **select**

Memory of the function responsible for resizing images. Choose how much memory to give to the function that resizes images.

#### `FUNCTION_TIMEOUT` (required)

Cloud Function timeout (in seconds)<br/>
type: **string**

The time the function has to finish its job.

#### `OUTPUT_STORAGE_BUCKET` (required)

Output Firebase Storage bucket name<br/>
type: **string**

The name of the bucket that the output PDF file will be stored in.

#### `FIRESTORE_COLLECTION` (required)

Firestore collection, its document creation events should be listened to<br/>
type: **string**

If provided, the extension will listen to creation events in this collection, and whenever a new document is created in this collection, it will generate a PDF based on its values.
