<h1 align="center">
  <img src="https://www.pdfplum.com/logo192.png" alt="PDFPlum">

<a href="https://www.pdfplum.com/#getting-started">Getting Started</a> |
<a href="https://www.pdfplum.com/#contact-us">Contact Us</a>

</h1>

# PDFPlum

PDFPlum is a set of Firebase extensions to generate PDF files from a template bundle using HTML/CSS and Handlebars, triggered by different sources.
Check out some examples of the generated PDFs [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples).

## Installation

Use one of these links based on your source of data to install the latest version of PDFPlum in your Firebase project.

- [firestore-pdf-generator (Firestore source)](https://console.firebase.google.com/project/_/extensions/install?ref=pdfplum/firestore-pdf-generator)
- [http-pdf-generator (HTTP source)](https://console.firebase.google.com/project/_/extensions/install?ref=pdfplum/http-pdf-generator)

## Usage

Documentation:

- [firestore-pdf-generator](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PREINSTALL.md)
- [http-pdf-generator](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PREINSTALL.md)

It is also all described in the installation page.

## Contribution

Before creating a commit, please run these commands while Firebase emulator is running to update documents:

```bash
npm run update
npm run lint
npm run test
```

If templates are not expected to be changed, you don't need Firebase emulator and you can skip regenerating sample PDF files like this:

```bash
PDF_PLUM_UPDATE_SKIP_SAMPLES=1 npm run update
npm run lint
npm run test
```

To deploy the extension you can run

```bash
npm run deploy
```

And to publish the project you can run

```bash
npm run publish
```

Make sure you push the commit that is identical to the going-to-be-published version, Firebase publishes from the GitHub repository, not your local copy.

Also write a summary of changes in the `CHANGELOG.md` file in the root directory of this repository. Versions containing `<!--subject:firestore-pdf-generator-->` in front of them will be included in the `CHANGELOG.md` file of the firestore-pdf-generator plugin and the ones containing `<!--subject:http-pdf-generator-->` will be included in the `CHANGELOG.md` file of the http-pdf-generator plugin. A version can have both tags.

Note that `CHANGELOG.md` files inside plugin folders is auto-generated and any modifications on these files will be lost.
