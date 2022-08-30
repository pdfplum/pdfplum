# Pre-installation

Use this extension to generate PDF files using Handlebars, Puppeteer and HTML. This extension requires you to define the template using HTML and Handlebars, package the resources into a Zip file and upload it to a Google Cloud Storage bucket. This extension triggers on a request to the HTTPS endpoint it exposes, downloads the template provided, runs Handlebars. The generated PDF file will be stored in a Firebase Storage bucket and you can also setup the extension to return in the HTTPS response.

For inspiration, there are some pre-made templates and their outputs prepared in the [template-samples/](https://github.com/sassanh/template-to-pdf/tree/main/template-samples) directory. Each of them include the HTMLs and their resources. The sample outputs can be found in each template's `generated` directory. To use any of these in your extension config, just upload the `.zip` file to a Storage bucket and include the complete path of the file in `TEMPLATE_PATH` extension parameter.

## Demo

You can download `basic-example.zip` template from [here](https://github.com/sassanh/template-to-pdf/tree/main/template-samples) and upload it to your Firebase Storage bucket and then run:

```bash
wget "https://us-central1-test-fdaf6.cloudfunctions.net/ext-pdf-generator-hipn-executePdfGenerator?templatePath=<TEMPLATE_PATH>&outputFileName=basic-example.pdf&chromiumPdfOptions[printBackground]=true&adjustHeightToFit=true&data[name]=World&data[title]=Title&data[articles][0][url]=wikipedia.org&data[articles][0][title]=Wikipedia&data[articles][1][url]=google.com&data[articles][1][title]=Google&data[description]=Description" -O basic-example.pdf
```

Where `TEMPLATE_PATH` is the path of the uploaded template file in your bucket (make sure you provide read access to it). This will save the generated pdf on your machine with name `basic-example.pdf`. You can change the get parameters providing `data` to see the pdf generated with different values. You can also unzip the template, change the html file/styles/etc, zip it and upload it to your bucket to see your changes in action.

## Additional setup

Before installing this extension, you'll need to:

- [Set up Firebase Storage in your Firebase project.](https://firebase.google.com/docs/storage)
- Create a template using HTML in `index.html` and [Handlebars.js](https://handlebarsjs.com)
- Upload zipped directory (`index.html` should be under the root of the zip)
- Make sure the function has read access to the file.

The templates in this extension are based on handlebars.js and can be configured via the means provided in this framework.

The printing mechanism is served by [Puppeteer](https://pptr.dev/) based on Chrome's PDF rendering engine.

## Why Puppeteer?

Based on testing done via different free PDF generation tools including Google Docs API, Pandoc, makepdf, and others, the best tool to run in Cloud Functions and support an easy way of templating via Handlebars was Puppeteer. All other tools had limitations which prevented a full end-to-end PDF templating solution. There are potential solutions using third-party PDF APIs but the goal of this extension was to support a free and simple solution.

## Usage

### The template

A zip file including an `index.html` file is the template bundle, it can include images, fonts, css files, etc. The `index.html` file can use all the files provided in the bundle assuming they are being served in `/`. So for example `images/flower.png` in the zip file will be served in `/images/flower.png`. The `index.html` file can also access resources in the internet, it is useful to load a font or load a script or css file from CDNs, etc.

### The endpoint

The extension serves an endpoint which generates a pdf based on the template file and the get parameters passed to it.

### What happens?

The template bundle will be uncompressed, served and loaded by a Chromium instance like a normal webpage. Handlebars will run on all `.html`, `.txt` and `.md` files to replace their template placeholders with data provided in get parameter `data`. After all network resources are completely loaded a pdf file is generated from the rendered webpage.

If a bucket name is set in `OUTPUT_STORAGE_BUCKET` extension parameter, generated pdf will be saved in that bucket. Also if `RETURN_PDF_IN_RESPONSE` is set, the pdf will be returned in the response of the endpoint.

### Get parameters

#### `outputFileName` (required)

It is used to set the name of the file saved in the Firebase Storage bucket, it is also used to set the name of the pdf file returned in the response.

#### `data`

The data to replace the template placeholders. It can include nested containers (array lists and associative arrays) as described [here](https://www.npmjs.com/package/qs).

#### `chromiumPdfOptions`

To control the pdf generation parameters.
Read about it [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html)

#### `adjustHeightToFit`

If set to `true` it will automatically adjust the height of the pdf so that all the content of the webpage can fit inside one page, the generated pdf in this case will always have only a single page.

#### `templatePath`

It overrides `TEMPLATE_PATH` extension parameter.

#### `shouldWaitForIsReady`

Setting this parameter will cause the function to wait for `window.isReady` to be set to true before rendering the pdf.

### Firebase Extension parameters

#### `OUTPUT_STORAGE_BUCKET`

The name of the bucket the generated pdf will be saved in.

#### `RETURN_PDF_IN_RESPONSE` (required)

Whether to return the generated pdf in the response of the endpoint or not.
If not set, a JSON response will be returned:

```json
{
  "done": "successful"
}
```

#### `TEMPLATE_PATH` (required)

The path of the zip file stored in a Firebase Storage bucket.
If a file is not found in this path, it will try it with ".zip" extension.

#### `LOCATION` (required)

The function will be deployed to this location.

#### `FUNCTION_MEMORY` (required)

Memory limit for the function, the default value is 1GB.

#### `FUNCTION_TIMEOUT` (required)

The time in seconds the function has to finish its job in.
