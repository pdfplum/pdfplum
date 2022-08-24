# Pre-installation

Use this extension to generate PDF files using Handlebars, Puppeteer and HTML.
This extension requires you to define the template using HTML and Handlebars,
package the resources into a Zip file and upload it to a Google Cloud Storage
bucket. This extension triggers on a request to the HTTPS endpoint it exposes,
downloads the template provided, runs Handlebars. The generated PDF file will be
stored in a Firebase Storage bucket and you can also setup the extension to
return in the HTTPS response.

For inspiration, there are a couple of pre-made templates and their outputs
prepared in the [template-samples/](/template-samples) directory. Each of them
include the HTMLs and their resources. The sample outputs can be found in each
template's `generated` directory. To use any of these in your extension config,
just upload the `.zip` file to a Storage bucket and include the complete path of
the file in `${TEMPLATE_PATH}`.

## Additional setup

Before installing this extension, you'll need to:

- [Set up Firebase Storage in your Firebase project.](https://firebase.google.com/docs/storage)
- Create a template using HTML in `index.html` and [Handlebars.js](https://handlebarsjs.com)
- Upload zipped directory (`index.html` should be under the root of the zip)
- Make sure the function has read access to the file.

The templates in this extension are based on handlebars.js and can be configured
via the means provided in this framework.

The printing mechanism is served by [Puppeteer](https://pptr.dev/) based on
Chrome's PDF rendering engine.

A [custom version](https://github.com/alixaxel/chrome-aws-lambda) of Puppeteer
designed for Cloud Functions is used.

## Why Puppeteer?

Based on testing done via different free PDF generation tools including Google
Docs API, Pandoc, makepdf, and others, the best tool to run in Cloud Functions
and support an easy way of templating via Handlebars was Puppeteer. All other
tools had limitations which prevented a full end-to-end PDF templating solution.
There are potential solutions using third-party PDF APIs but the goal of this
extension was to support a free and simple solution.
