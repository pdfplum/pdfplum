<h1 align="center">
  <img src="https://www.pdfplum.com/logo192.png" alt="PDFPlum">

<a href="https://www.pdfplum.com/#getting-started">Getting Started</a> |
<a href="https://www.pdfplum.com/#contact-us">Contact Us</a>

</h1>

<!--toc:start-->

- [PDFPlum](#pdfplum)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contribution](#contribution)
    - [Commititng](#commititng)
    - [Deploying](#deploying)
    - [Publishing](#publishing)
    - [Updating `CHANGELOG.md`](#updating-changelogmd)

<!--toc:end-->

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

### Deploying

Run this command to deploy the current source code to the Firebase projects specified in `.firebaserc`.

```sh
npm run deploy
```

### Updating `CHANGELOG.md`

Write a summary of changes in the `CHANGELOG.md` file in the root directory of this repository. Versions containing `<!--subject:firestore-pdf-generator-->` in front of them will be included in the `CHANGELOG.md` file of the firestore-pdf-generator plugin and the ones containing `<!--subject:http-pdf-generator-->` will be included in the `CHANGELOG.md` file of the http-pdf-generator plugin. A version can have both tags.

Note that `CHANGELOG.md` files inside plugin folders is auto-generated and any modifications on these files will be lost.

### Commititng

Before creating a commit, please run these commands and make sure they all pass without any errors:

```sh
PDF_PLUM_UPDATE_SKIP_SAMPLES=1 npm run update
npm run lint
npm run test
```

These commands will update documentations, update `CHANGELOG.md` files, sync versions based on `CHANGELOG.md`, etc.

If sample PDF files are expected to be changed, you neeed to run the project in Firebase emulator and run these commands instead:

```sh
npm run update
npm run lint
npm run test
```

This way the sample PDF files will be regenerated.

### Publishing

Run this command to publish:

```sh
PUBLISHER_ID=<your-publisher-id> npm run publish
```

Make sure you have already pushed the commit that is identical to the going-to-be-published version, Firebase publishes from the GitHub repository, not your local copy.
