# Changelog

## Version 0.8.0

- New usage: run function when `document.create` event of Firestore is triggered.
- Add "invoice-1" template sample.
- Add handlebars helpers provided by [handlebars-helpers](https://github.com/helpers/handlebars-helpers) for `array`, `collection`, `comparison`, `date`, `math`, `number` `string` and `url`.
- Add `test.js` script to make testing template samples easier by running the feedback loop faster.
- Change `true`/`false` extension variable values to `yes`/`no`.
- Add a script to generate extension variables section of `PREINSTALL.md` document (it used to be written manually) so that it can be used in git precommit hooks.
- Add a script to update all template samples zip files and pdf files so that it can be used in git precommit hooks.
- Add get parameters of each template sample as JSON data in a file with the same name as the template sample with `.json` extension.

## Version 0.7.11

- Log all console messages and errors reported by Puppeteer.
- Remove "basic-example" and add "demo" template sample instead. This new template sample better shows different features of the extension and is expected to get updated with the new features coming in the future.

## Version 0.7.10

- Avoid http requests time out and return http response with status code 404. Instead when a resource is not available in the bundle.

## Version 0.7.9

- Move usage section from `README.md` to `PREINSTALL.md`.
- Add sample curl request to `POSTINSTALL.md`.
- Add demo section in `PREINSTALL.md`.

## Version 0.7.8

- Setup testing infrastructure. (`jest`, setting up environment, etc) ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/sassanh/template-to-pdf/pull/4))
- Configure GitHub actions for the repository.

## Version 0.7.7

- Bugfix: `json` handlebars helper was returning urlencoded version of the json string. It is now marked as safe string and is returning something that can be consumed in JavaScript.

## Version 0.7.6

- Add `shouldWaitForIsReady` in get parameters. Setting this parameter will cause the function to wait for `window.isReady` to be set to true before rendering the pdf.

## Version 0.7.5

- Format documentation markdown files in the repository using Prettier.

## Version 0.7.4

- Add `json` helper to handlebars so that data can be passed through js script in tags in template files as JSON. [reference](https://stackoverflow.com/a/10233247/1349278)

## Version 0.7.3

- Drop 512MB option for `FUNCTION_MEMORY` parameter.
- Add links to parameters documentation and sample invocations in `POSTINSTALL.md`.
- Format documentation markdown files in the repository using [remark](https://github.com/remarkjs/remark).

## Version 0.7.2

- Improve documentation ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/sassanh/template-to-pdf/pull/3))
- Change boolean extension parameters values to yes/no instead of true/false ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/sassanh/template-to-pdf/pull/2))
- Update regular expression of `TEMPLATE_PATH` to allow zip extensions for template paths ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/sassanh/template-to-pdf/pull/1))
- Set actual version number in package.json (instead of `<VERSION>` placeholder) and check if it matches with CHANGELOG.md version instead of setting it in publish script. This is to help local development where a placeholder version in package.json makes initial setup inconvenient.
- Update regular expression of `TEMPLATE_PATH` to allow nested paths.

## Version 0.7.1

- Fix for when `OUTPUT_STORAGE_BUCKET` is not set and yet the extension tries to save the pdf to Firebase Storage.

## Version 0.7.0

- Merge `TEMPLATE_STORAGE_BUCKET` and `TEMPLATE_ID` into `TEMPLATE_PATH`.

## Version 0.6.1

- Apply markdown validation on markdown files using [remark](https://github.com/remarkjs/remark).
- Set actual version number in extension.yaml (instead of `<VERSION>` placeholder) and check if it matches with CHANGELOG.md version instead of setting it in publish script. This is to help local development where a version number is needed in extension.yaml file.
- Fix links in markdown files
- Provide instructions for settings storage rules.

## Version 0.6.0

- Add default value for Firebase Storage bucket names and template id in extension parameters.
- Allow both "template-id.zip" and "template-id" (with and without ".zip" extension) values for TEMPLATE_ID parameter.
- Fixed FUNCTION_TIMEOUT's regular expression to only allow values less than or equal 540.

## Version 0.5.2

- Add `admin.initializeApp()` before initializing event arc channel.
- Remove `console.log`s

## Version 0.5.0

- Add events for when the pdf generation finishes, one for when it finishes successfully and another for when an error occurs.

## Version 0.4.1

- Minor cleanup

## Version 0.4.0

- Add a markdown template example so that everyone can easily copy it and put their own markdown in case they prefer Markdown over html/css.
- Add `adjustHeightToFit` to automatically set the page height to the height of content so that everything can fit in a single page. Useful for generating single page pdf files.
- Introduce `chromiumPdfOptions` in get parameters to control the pdf generation. Options described [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html).
- Instead of providing template values directly in get parameters, now they should be provided as keys of `data` get parameter.
- `_` prefix is eliminated for all get parameters.
- Add detailed installation and usage instructions in `README.md`.

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

- Accept Microsoft Office Template files (dotx, potx and xltx) as input.

## Version 0.1.0

- Initial release. Supports templating via Google Docs Editors documents and Microsoft Office documents and exports to PDF.
