# Changelog

## Version 0.13.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Fix URLs in the documents.
- Update the README.md file's contribution section.

## Version 0.13.1 <!--subject:firestore-pdf-generator-->

- Listen to `document.write` instead of `document.create` so that the extension is triggered both with document creations as wells as document modifications.

## Version 0.13.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Read `_pdfplum_config` key of Firestore documents in firestore-pdf-generator. #10
- List parameters provided by `_pdfplum_config` in `PARAMETERS.md`.
- Move GET parameters and extension parameters to `PARAMETERS.md`.
- Improve documents (fix some invalid links, etc).

## Version 0.12.19 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- The name of the root directory inside the ZIP file containing `index.html` is no longer needed to match with the filename of the ZIP file.

## Version 0.12.18 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Fix the value of `main` entry in package.json. #8

## Version 0.12.17 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Update NPM packages to their latest versions.
- Update `PREINSTALL.md` files.
- Fix typo in `wget` sample in `http-pdf-generator/POSTINSTALL.md`. #7

## Version 0.12.16 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Remove parameters section from `PREINSTALL.md` files.
- Add billing section to `PREINSTALL.md` files.
- Shorten extension names.

## Version 0.12.15 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Revise and enhance documentation content.

## Version 0.12.14 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Upgrade `publish` and `update:docs` scripts to put the generated `CHANGELOG.md` of the extensions in the repository. Previously they were just added to the published bundle.
- Add tags to `extension.yaml`.
- Temporarily copy `lib` from `common-stuff` to each extension's directory as firebase needs it in the automatic publish procedure.
- Update npm libraries to their latest versions (including updating TypeScript to version 5.0.4).
- Improve publish script to provide `--repo`, `--root` and `--ref` options to firebase cli.

## Version 0.12.13 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Resize icons to better fit in the icon circle

## Version 0.12.8 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add icons to extension.yaml files

## Version 0.12.7 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- New icon

## Version 0.12.6 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add icons to the published extension bundle

## Version 0.12.5 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add icons
- Fine tune yaml linter settings

## Version 0.12.4 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Rename function names from `executePdfGeneratorHttp` and `executePdfGeneratorFirestore` to `executePdfGenerator`
- Downgrade Puppeteer to `^18` again as version 19 still has problems with Google Cloud functions.

## Version 0.12.3 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Workaround for [an issue](https://github.com/puppeteer/puppeteer/issues/9533) in Puppeteer not being able to reach the downloaded binary.

## Version 0.12.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Move `module-alias` from development dependency to production dependency as it is needed in production environment.

## Version 0.12.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Make `firestore-pdf-generator` extension parameter `FIRESTORE_COLLECTION` a mandatory parameter.
- `CHANGELOG.md` has `<!--subject:<EXTENSION_ID>-->` comments in front of each version entry to determine which extensions each entry applies to.
- `update:versions` will update the version of each extension to the latest version in `CHANGELOG.md` that applies to that particular extension.
- `publish` will put a filtered version of `CHANGELOG.md` in each extension before publishing. This filtered version only contains entries relevant to that particular extension.
- Clean extensions' build directory before building them to avoid unused compiled files in the publishing bundle.

## Version 0.12.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Separate the extension into two extensions `firestore-pdf-generator` and `http-pdf-generator`.
- Update documents accordingly.
- Avoid duplicated code by extracting common parts in two extensions and putting them in `common-stuff/` directory.
- Add `datastore.user` role and reduce `storage.admin` to `storage.objectAdmin`.

## Version 0.11.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Remove "Update security rules" section from `POSTINSTALL.md` as after using `storage.admin` role for the extension it is no longer required to set security rules.

## Version 0.11.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Fix dropping last part of template prefix when extracting it from `templatePath` parameter which caused the extension to try to download the template from a wrong url.

## Version 0.11.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add `storage.admin` role to extension so that it can work with private Firebase Storage buckets.
- Rename the extension from `pdfplum/pdfplum` to `pdfplum/pdf-generator` to match Firebase extensions naming pattern.
- Use `firebase-admin/storage` to directly download the file content instead of first getting its url and then `fetch`ing it.

## Version 0.10.4 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Downgrade Puppeteer to `^18` to workaround [issue](https://github.com/puppeteer/puppeteer/issues/9533) as suggested in its comments.

## Version 0.10.3 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Workaround for [an issue](https://github.com/puppeteer/puppeteer/issues/9533) in Puppeteer not being able to reach the downloaded binary.

## Version 0.10.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Update Puppeteer to version `19.6.3`.
- Move Puppeteer cache to `__dirname`.

## Version 0.10.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add `--open-pdf` option to `run` script, if not provided, PDF file won't be opened after being generated.

## Version 0.10.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Drop dashes in the extension name and repository name `pdf-plum` -> `pdfplum`.

## Version 0.9.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add `networkIdleTime` (milliseconds) GET parameter. PDFPlum will only start rendering the PDF file, as soon as the specified duration passes without any network activity.

## Version 0.9.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Rename the extension to pdfplum.
- Add link to the [website](https://pdfplum.com).
- `package.json` script entries `dev:run` and `dev:run:headful` to run the extension for a template provided as the argument.
- Update docs

## Version 0.8.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- New usage: run function when `document.create` event of Firestore is triggered.
- Add "invoice-1" template sample.
- Add handlebars helpers provided by [handlebars-helpers](https://github.com/helpers/handlebars-helpers) for `array`, `collection`, `comparison`, `date`, `math`, `number` `string` and `url`.
- Add `run.js` script to make testing template samples easier by running the feedback loop faster.
- Change `true`/`false` extension variable values to `yes`/`no`.
- Add a script to generate extension variables section of `PREINSTALL.md` document (it used to be written manually) so that it can be used in git precommit hooks.
- Add a script to update all template samples ZIP files and PDF files so that it can be used in git precommit hooks.
- Add GET parameters of each template sample as JSON data in a file with the same name as the template sample with `.json` extension.

## Version 0.7.11 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Log all console messages and errors reported by Puppeteer.
- Remove "basic-example" and add "demo" template sample instead. This new template sample better shows different features of the extension and is expected to get updated with the new features coming in the future.

## Version 0.7.10 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Avoid http requests time out and return http response with status code 404. Instead when a resource is not available in the bundle.

## Version 0.7.9 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Move usage section from `README.md` to `PREINSTALL.md`.
- Add sample curl request to `POSTINSTALL.md`.
- Add demo section in `PREINSTALL.md`.

## Version 0.7.8 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Setup testing infrastructure. (`jest`, setting up environment, etc) ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/pdfplum/pdfplum/pull/4))
- Configure GitHub actions for the repository.

## Version 0.7.7 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Bugfix: `json` handlebars helper was returning urlencoded version of the json string. It is now marked as safe string and is returning something that can be consumed in JavaScript.

## Version 0.7.6 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add `shouldWaitForIsReady` in GET parameters. Setting this parameter will cause the function to wait for `window.isReady` to be set to true before rendering the PDF.

## Version 0.7.5 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Format documentation markdown files in the repository using Prettier.

## Version 0.7.4 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add `json` helper to handlebars so that data can be passed through js script in tags in template files as JSON. [reference](https://stackoverflow.com/a/10233247/1349278)

## Version 0.7.3 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Drop 512MB option for `FUNCTION_MEMORY` parameter.
- Add links to parameters documentation and sample invocations in `POSTINSTALL.md`.
- Format documentation markdown files in the repository using [remark](https://github.com/remarkjs/remark).

## Version 0.7.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Improve documentation ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/pdfplum/pdfplum/pull/3))
- Change boolean extension parameters values to yes/no instead of true/false ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/pdfplum/pdfplum/pull/2))
- Update regular expression of `TEMPLATE_PATH` to allow zip extensions for template paths ([Darren Ackers](https://github.com/dackers86) - [PR](https://github.com/pdfplum/pdfplum/pull/1))
- Set actual version number in package.json (instead of `<VERSION>` placeholder) and check if it matches with CHANGELOG.md version instead of setting it in publish script. This is to help local development where a placeholder version in package.json makes initial setup inconvenient.
- Update regular expression of `TEMPLATE_PATH` to allow nested paths.

## Version 0.7.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Fix for when `OUTPUT_STORAGE_BUCKET` is not set and yet the extension tries to save the PDF to Firebase Storage.

## Version 0.7.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Merge `TEMPLATE_STORAGE_BUCKET` and `TEMPLATE_ID` into `TEMPLATE_PATH`.

## Version 0.6.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Apply markdown validation on markdown files using [remark](https://github.com/remarkjs/remark).
- Set actual version number in extension.yaml (instead of `<VERSION>` placeholder) and check if it matches with CHANGELOG.md version instead of setting it in publish script. This is to help local development where a version number is needed in extension.yaml file.
- Fix links in markdown files
- Provide instructions for settings storage rules.

## Version 0.6.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add default value for Firebase Storage bucket names and template id in extension parameters.
- Allow both "template-id.zip" and "template-id" (with and without ".zip" extension) values for TEMPLATE_ID parameter.
- Fixed FUNCTION_TIMEOUT's regular expression to only allow values less than or equal 540.

## Version 0.5.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add `admin.initializeApp()` before initializing event arc channel.
- Remove `console.log`s

## Version 0.5.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add events for when the PDF generation finishes, one for when it finishes successfully and another for when an error occurs.

## Version 0.4.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Minor cleanup

## Version 0.4.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Add a markdown template example so that everyone can easily copy it and put their own markdown in case they prefer Markdown over HTML/CSS.
- Add `adjustHeightToFit` to automatically set the page height to the height of content so that everything can fit in a single page. Useful for generating single page PDF files.
- Introduce `chromiumPdfOptions` in GET parameters to control the PDF generation. Options described [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html).
- Instead of providing template values directly in GET parameters, now they should be provided as keys of `data` GET parameter.
- `_` prefix is eliminated for all GET parameters.
- Add detailed installation and usage instructions in `README.md`.

## Version 0.3.3 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Update documents

## Version 0.3.2 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Install Puppeteer for local test
- Use chrome-aws-lambda instead of Puppeteer to improve performance

## Version 0.3.1 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Make most parameters mutable
- Add `FUNCTION_TIMEOUT` parameter
- Add `FUNCTION_MEMORY` parameter
- Add `LOCATION` parameter
- Add fetch polyfill to support NodeJS 16 runtime
- Add description for parameters

## Version 0.3.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Provide sample templates in the repository.
- Organize code structure.

## Version 0.2.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Accept Microsoft Office Template files (dotx, potx and xltx) as input.

## Version 0.1.0 <!--subject:firestore-pdf-generator--><!--subject:http-pdf-generator-->

- Initial release. Supports templating via Google Docs Editors documents and Microsoft Office documents and exports to PDF.
