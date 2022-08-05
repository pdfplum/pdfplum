## Version 0.4.0

- Added a markdown template example so that everyone can easily copy it and put their own markdown in case they prefer markdown over html/css.
- Added `adjustHeightToFit` to automatically set the page height to the height of content so that everything can fit in a single page. Useful for generating single page pdf files.
- Introducing `chromiumPdfOptions` in get parameters to control the pdf generation. Options described [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html).
- Instead of providing template values directly in get parameters, now they should be provided as keys of `data` get parameter.
- `_` prefix is eliminated for all get parameters.
- Added detailed installation and usage instructions in `README.md`.

## Version 0.3.3

- Update documents

## Version 0.3.2

- Install puppeteer for local test
- Use chrome-aws-lambda instead of puppeteer to improve performance

## Version 0.3.1

- Make most parameters mutable
- Add `FUNCTION_TIMEOUT` parameter
- Add `FUNCTION_MEMORY` parameter
- Add `LOCATION` parameter
- Add fetch polyfill to support NodeJS 16 runtime
- Add description for parameters

## Version 0.3.0

- Provide sample templates in the repository.
- Organize code structure.

## Version 0.2.0

Accept Microsoft Office Template files (dotx, potx and xltx) as input.

## Version 0.1.0

Initial release. Supports templating via Google Docs Editors documents and Microsoft Office documents and exports to PDF.
