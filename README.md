# Pdf generator

This is a Firebase extension to generate pdf files from a template bundle using HTML/CSS and Handlebars. Check out some examples of the generated pdfs [here](template-samples).

---

## Installation

Use [this](https://console.firebase.google.com/project/test-fdaf6/extensions/install?ref=sassanh%2Fpdf-generator) install link to install the latest version of pdf-generator in your Firebase project.

Or use [this](https://console.firebase.google.com/project/test-fdaf6/extensions/install?ref=sassanh%2Fpdf-generator@0.4.0) link to install a specific version.

Check [Firebase Extension parameters](#firebase-extension-parameters) for details about the parameters set in the installation process.

---

## Usage

### The template

A zip file including an `index.html` file is the template bundle, it can include images, fonts, css files, etc. The `index.html` file can use all the files provided in the bundle assuming they are being served in `/`. So for example `images/flower.png` in the zip file will be served in `/images/flower.png`. The `index.html` file can also access resources in the internet, it is useful to load a font or load a script or css file from CDNs, etc.

### The endpoint

Call this http endpoint: [https://${param:LOCATION}-${param:PROJECT_ID}.cloudfunctions.net/ext-${param:EXTENSION_ID}-executePdfGenerator]() with the parameters explained [below](#get-parameters) as get parameters.

### What happens?

The template bundle will be uncompressed, served and loaded by a Chromium instance like a normal webpage. Handlebars will run on all `.html`, `.txt` and `.md` files to replace their template placeholders with data provided in get parameter `data`. After all network resources are completely loaded a pdf file is generated from the rendered webpage.

If a bucket name is provided in `${param:TEMPLATE_STORAGE_BUCKET}` is set, generated pdf will be saved in that bucket. Also if `${param:RETURN_PDF_IN_RESPONSE}` is set, the pdf will be returned in the response of the endpoint.

### Get parameters

#### `outputFileName` (required)

It is used to set the name of the file saved in the Firebase Storage bucket, it is also used to set the name of the pdf file returned in the response.

#### `data`

The data to replace the template placeholders. It can include nested containers (array lists and associative arrays) as described [here](https://www.npmjs.com/package/qs).

#### `chromiumPdfOptions`

To control the pdf generation parameters. Read about it [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html)

#### `adjustHeightToFit`

If set to `true` it will automatically adjust the height of the pdf so that all the content of the webpage can fit inside one page, the generated pdf in this case will always have only a single page.

#### `templateId`

It overrides `${param:TEMPLATE_ID}`.

### Firebase Extension parameters

#### `OUTPUT_STORAGE_BUCKET` 

The name of the bucket the generated pdf will be saved in.

#### `RETURN_PDF_IN_RESPONSE` (required)

Whether to return the generated pdf in the response of the endpoint or not. If not set, a JSON response will be returned:
```json
{
  "done": "successful"
}
```

#### `TEMPLATE_STORAGE_BUCKET` (required)

The name of the bucket serving the template zip file.

#### `TEMPLATE_ID` (required)

The name of the zip file stored in `${param:TEMPLATE_STORAGE_BUCKET}`, without `.zip` extension at the end.

#### `LOCATION` (required)

The function will be deployed to this location.

#### `FUNCTION_MEMORY` (required)

Memory limit for the function, the default value is 1GB.

#### `FUNCTION_TIMEOUT` (required)

The time in seconds the function has to finish its job in.
