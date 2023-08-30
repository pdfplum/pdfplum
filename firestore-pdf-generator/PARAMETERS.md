# Parameters

## Embedded parameters

The rest of the Firestore document except the key `_pdfplum_config` provides the values to replace the template placeholders.

It can include fields with `string`, `number`, `boolean`, `timestamp` and `null` data types as well as nested container fields with `map` and `array` data types.

The optional `_pdfplum_config` field of the Firestore document should be a `map` and is taken as the embedded config. It overrides some of the extension parameters. It can include any of these keys:

### `outputFileName`

`string`

Sets the name of the output PDF file to be saved in the Firebase Storage bucket and the name of the PDF file returned in the response.

If not provided, it will default to the id of the created Firestore document.

### `adjustHeightToFit`

`boolean`

Overrides the [`ADJUST_HEIGHT_TO_FIT`](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#adjustheighttofit-required) extension parameter.

### `chromiumPdfOptions`

`map`

Overrides the [`CHROMIUM_PDF_OPTIONS`](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#chromiumpdfoptions-optional) extension parameter.

### `networkIdleTime`

`number`

Overrides the [`NETWORK_IDLE_TIME`](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#networkidletime-required) extension parameter.

### `shouldWaitForIsReady`

`boolean`

Overrides the [`SHOULD_WAIT_FOR_IS_READY`](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#shouldwaitforisready-required) extension parameter.

### `templatePath`

`string`

Overrides the [`TEMPLATE_PATH`](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#templatepath-required) extension parameter.

## Firebase extension parameters

### `SHOULD_MAKE_PDF_PUBLIC` (required)

Determines if the generated PDF in the output storage bucket should be public or private.<br/>
type: **select**

Whether the generated PDF file should be public or private.

### `TEMPLATE_PATH` (required)

Template path<br/>
type: **string**

The path of the zip file containing the template files stored in a Firebase Storage bucket. Can be overridden by GET parameters.

### `ADJUST_HEIGHT_TO_FIT` (required)

Should PDFPlum automatically set the document height to fit its content?<br/>
type: **select**

If enabled, the extension will automatically adjust the height of the PDF so that all the contents of the webpage can fit inside one page. The generated PDF file in this case will always have only a single page. Can be overridden by GET parameters.

### `CHROMIUM_PDF_OPTIONS` (required)

Chromium PDF generation options<br/>
type: **string**

Options to be passed to Chromium's PDF generation engine provided as a JSON string. Documented [here](https://www.puppeteersharp.com/api/PuppeteerSharp.PdfOptions.html). Can be overridden by GET parameters.

### `NETWORK_IDLE_TIME` (required)

Network idle time (in milliseconds)<br/>
type: **string**

The amount of time without any network activity before rendering the PDF file starts. This ensures all external resources are loaded and allows for a grace period.

### `SHOULD_WAIT_FOR_IS_READY` (required)

Wait for `isReady`?<br/>
type: **select**

ndicates whether the extension should wait for the `window.isReady` variable to be set to `true` before rendering the PDF. Can be overridden by GET parameters.

### `OUTPUT_STORAGE_BUCKET` (required)

Output Firebase Storage bucket name<br/>
type: **string**

The name of the bucket where the output PDF file will be stored.

### `FIRESTORE_COLLECTION` (required)

Firestore collection, its document creation events should be listened to<br/>
type: **string**

The extension will monitor creation events in this collection. When a new document is created in this collection, a PDF will be generated based on the document's values.
