# Pre-installation

Use this extension to generate PDF files using Handlebars, Puppeteer and HTML. This extension requires you to define the template using HTML and Handlebars, package the resources into a Zip file and upload it to a Google Cloud Storage bucket. This extension triggers on a request to the HTTPS endpoint it exposes, downloads the template provided, runs Handlebars. The generated PDF file will be stored in a Firebase Storage bucket and you can also setup the extension to return in the HTTPS response.

For inspiration, there are some pre-made templates and their outputs prepared in the [template-samples/](https://github.com/sassanh/template-to-pdf/tree/main/template-samples) directory. Each of them include the HTMLs and their resources. The sample outputs can be found in each template's `generated` directory. To use any of these in your extension config, just upload the `.zip` file to a Storage bucket and include the complete path of the file in `TEMPLATE_PATH` extension parameter.

## Demo

You can download `demo.zip` template from [here](https://github.com/sassanh/template-to-pdf/tree/main/template-samples) and upload it to your Firebase Storage bucket and then run:

```bash
wget "https://us-central1-test-fdaf6.cloudfunctions.net/ext-pdf-generator-hipn-executePdfGenerator?templatePath=<TEMPLATE_PATH>&chromiumPdfOptions[format]=a5&chromiumPdfOptions[printBackground]=true&adjustHeightToFit=no&data[text]=Lorem ipsum dolor sit amet consectetur adipisicing elit.&data[flag]=OK&data[articles][0][title]=ABCD&data[articles][0][content]=Abcd content&data[articles][1][title]=EFGH&data[articles][1][content]=Efgh content&data[articles][2][title]=IJKL&data[articles][2][content]=Ijkl content&data[articles][3][title]=MNOP&data[articles][3][content]=Mnop content&data[articles][4][title]=QRST&data[articles][4][content]=Qrst content&data[colors][warm][0]=Red&data[colors][warm][1]=Yellow&data[colors][warm][2]=Orange&data[colors][cold][0]=Green&data[colors][cold][1]=Blue&data[colors][cold][2]=Gray&data[info][Age]=38&data[info][Name]=John Doe&data[info][Birthday]=1985%2F20%2F06&data[info][Address]=Silicon Valley" -O demo.pdf
```

Where `TEMPLATE_PATH` is the path of the uploaded template file in your bucket (make sure you provide read access to it). This will save the generated pdf on your machine with name `demo.pdf`. You can change the get parameters providing `data` to see the pdf generated with different values. You can also unzip the template, change the html file/styles/etc, zip it and upload it to your bucket to see your changes in action.

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

### Firestore

If [`FIRESTORE_COLLECTION`](#firestorecollection-optional) is provided, whenever a document is created in that collection, the extension will generate a pdf based on the template file and the content of the created document.

### The endpoint

The extension also serves an endpoint which generates a pdf based on the template file and the get parameters passed to it.

### What happens?

The template bundle will be uncompressed, served and loaded by a Chromium instance like a normal webpage. Handlebars will run on all `.html`, `.txt` and `.md` files to replace their template placeholders with data provided in either get parameter `data` (in case of an http call trigger) or the created document (in case of a Firestore creation event trigger). After all network resources are completely loaded a pdf file is generated from the rendered webpage.

If a bucket name is set in [`OUTPUT_STORAGE_BUCKET`](#outputstoragebucket-optional) extension parameter, generated pdf will be saved in that bucket. Also if `RETURN_PDF_IN_RESPONSE` is set, the pdf will be returned in the response of the http call.

The pdf file will be named based on the rules described [here](#outputfilename).

### Get parameters

#### `outputFileName`

It is used to set the name of the file saved in the Firebase Storage bucket, it is also used to set the name of the pdf file returned in the response.
If not provided, a name will be generated by concatenating a uuid and the current timestamp.

Note that when the function is triggered by Firestore, the output file name will be the id of the document.

#### `data`

The data to replace the template placeholders. It can include nested containers (array lists and associative arrays) as described [here](https://www.npmjs.com/package/qs).

#### `adjustHeightToFit`

It overrides [`ADJUST_HEIGHT_TO_FIT`](#adjustheighttofit-required) extension parameter.

#### `chromiumPdfOptions`

It overrides [`CHROMIUM_PDF_OPTIONS`](#chromiumpdfoptions-optional) extension parameter.

#### `shouldWaitForIsReady`

It overrides [`SHOULD_WAIT_FOR_IS_READY`](#shouldwaitforisready-required) extension parameter.

#### `templatePath`

It overrides [`TEMPLATE_PATH`](#templatepath-required) extension parameter.

### Firebase Extension parameters

#### `OUTPUT_STORAGE_BUCKET` (optional)

Output Firebase Storage bucket name.<br/>
type: **string**

The name of the bucket the output pdf will be stored in.

#### `RETURN_PDF_IN_RESPONSE` (required)

Should the endpoint return the generated pdf?<br/>
type: **select**

Whether the generated pdf should be returned in the response of the endpoint or not. If not set, a JSON report will be returned instead:

```json
{
  "done": "successful"
}
```

#### `TEMPLATE_PATH` (required)

Template path<br/>
type: **string**

The path of the zip file containing the template files stored in a Firebase Storage bucket. Can be overrided by get parameters.

#### `ADJUST_HEIGHT_TO_FIT` (required)

Should it automatically set the document height to fit its content?<br/>
type: **select**

If set, it will automatically adjust the height of the pdf so that all the content of the webpage can fit inside one page. The generated pdf in this case will always have only a single page. Can be overrided by get parameters.

#### `CHROMIUM_PDF_OPTIONS` (optional)

Chromium pdf generation options<br/>
type: **string**

Options to pass to Chromium pdf generation engine provided as a JSON string. Documented [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html). Can be overrided by get parameters.

#### `SHOULD_WAIT_FOR_IS_READY` (required)

Wait for `isReady`?<br/>
type: **select**

Whether it should wait for `window.isReady` variable to be set to true before rendering the pdf or not. Can be overrided by get parameters.

#### `FIRESTORE_COLLECTION` (optional)

Firestore collection to listen to its insertions<br/>
type: **string**

If provided, the extension will listen to create events in this collection and whenever a new document is created in this collection will generate a pdf based on its values.

#### `LOCATION` (required)

Cloud Functions location<br/>
type: **select**

The location you want to deploy the functions created for this extension. You usually want a location close to your Storage bucket. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

#### `FUNCTION_MEMORY` (required)

Cloud Function memory<br/>
type: **select**

Memory of the function responsible of resizing images. Choose how much memory to give to the function that resize images. (For animated GIF => GIF we recommend using a minimum of 2GB).

#### `FUNCTION_TIMEOUT` (required)

Cloud Function timeout<br/>
type: **string**

The time in seconds the function has to finish its job.
