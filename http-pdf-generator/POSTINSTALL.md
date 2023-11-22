# Usage

## Triggering the function

You can start testing this extension right away.

1. Go to your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${STORAGE_BUCKET}/files) in Firebase console.

1. Download `demo.zip` from [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples), and upload it to Firebase Storage under `${param:TEMPLATE_PATH}`.

1. Run this command:

   ```sh
    wget --method=POST --body-data='{"templatePath": "${param:TEMPLATE_PATH}", "outputFileName": "demo.pdf", "chromiumPdfOptions": {"format": "a5", "printBackground": true}, "adjustHeightToFit": "no", "data": {"text": "Lorem ipsum dolor sit amet consectetur adipisicing elit.", "flag": "OK", "articles": [{"title": "ABCD", "content": "Abcd content"}, {"title": "EFGH", "content": "Efgh content"}, {"title": "IJKL", "content": "Ijkl content"}, {"title": "MNOP", "content": "Mnop content"}, {"title": "QRST", "content": "Qrst content"}], "colors": {"warm": ["Red", "Yellow", "Orange"], "cold": ["Green", "Blue", "Gray"]}, "info": {"Age": 38, "Name": "John Doe", "Birthday": "6/20/1985", "Address": "Silicon Valley"}}}' --header='Content-Type: application/json' --output-document=demo.pdf "https://${param:LOCATION}-${PROJECT_ID}.cloudfunctions.net/ext-${EXT_INSTANCE_ID}-executePdfGenerator"
   ```

   If [`RETURN_PDF_IN_RESPONSE`](https://github.com/pdfplum/pdfplum/tree/main/pdf-generator/PARAMETERS.md#returnpdfinresponse-required) is set, the PDF file will be stored as `demo.pdf` in your filesystem, otherwise you better change `... -O demo.pdf` to `... -O info.json`, because the response will contain general information about the generated PDF file in JSON format.

   If [`OUTPUT_STORAGE_BUCKET`](https://github.com/pdfplum/pdfplum/tree/main/pdf-generator/PARAMETERS.md#outputstoragebucket-optional) extension parameter is provided, the generated PDF file will also be stored in Firebase Storage under `${param:OUTPUT_STORAGE_BUCKET}/demo.pdf`. You can check it in your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${param:OUTPUT_STORAGE_BUCKET}/files).

## Documentation

- JSON payload parameters provided in the body of the endpoint call are documented [here](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#json-payload-parameters).
- Extension parameters are documented [here](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PARAMETERS.md#firebase-extension-parameters).
- You can find sample invocations of the endpoint [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples).
