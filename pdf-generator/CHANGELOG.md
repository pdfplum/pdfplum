## Version 0.7.1

*   Fix for when `OUTPUT_STORAGE_BUCKET` is not set and yet the extension tries to save the pdf to Firebase Storage.

## Version 0.7.0

*   Merge `TEMPLATE_STORAGE_BUCKET` and `TEMPLATE_ID` into `TEMPLATE_PATH`.

## Version 0.6.1

*   Apply markdown validation on markdown files using [remark](https://github.com/remarkjs/remark).
*   Set actual version number in extension.yaml (instead of `<VERSION>` placeholder) and check if it matches with CHANGELOG.md version instead of setting it in publish script. This is to help local development where a version number is needed in extension.yaml file.
*   Fix links in markdown files
*   Provide instructions for settings storage rules.

## Version 0.6.0

*   Add default value for Firebase Storage bucket names and tempalte id in extension parameters.
*   Allow both "template-id.zip" and "tempalte-id" (with and without ".zip" extension) values for TEMPALTE\_ID parameter.
*   Fixed FUNCTION\_TIMEOUT's regular expression to only allow values less than or equal 540.

## Version 0.5.2

*   Add `admin.initializeApp()` before initializing event arc channel.
*   Remove `console.log`s

## Version 0.5.0

*   Add events for when the pdf generation finishes, one for when it finishes successfully and another for when an error occurs.

## Version 0.4.1

*   Minor cleanup

## Version 0.4.0

*   Add a markdown template example so that everyone can easily copy it and put their own markdown in case they prefer Markdown over html/css.
*   Add `adjustHeightToFit` to automatically set the page height to the height of content so that everything can fit in a single page. Useful for generating single page pdf files.
*   Introduce `chromiumPdfOptions` in get parameters to control the pdf generation. Options described [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html).
*   Instead of providing template values directly in get parameters, now they should be provided as keys of `data` get parameter.
*   `_` prefix is eliminated for all get parameters.
*   Add detailed installation and usage instructions in `README.md`.

## Version 0.3.3

*   Update documents

## Version 0.3.2

*   Install puppeteer for local test
*   Use chrome-aws-lambda instead of puppeteer to improve performance

## Version 0.3.1

*   Make most parameters mutable
*   Add `FUNCTION_TIMEOUT` parameter
*   Add `FUNCTION_MEMORY` parameter
*   Add `LOCATION` parameter
*   Add fetch polyfill to support NodeJS 16 runtime
*   Add description for parameters

## Version 0.3.0

*   Provide sample templates in the repository.
*   Organize code structure.

## Version 0.2.0

*   Accept Microsoft Office Template files (dotx, potx and xltx) as input.

## Version 0.1.0

*   Initial release. Supports templating via Google Docs Editors documents and Microsoft Office documents and exports to PDF.
