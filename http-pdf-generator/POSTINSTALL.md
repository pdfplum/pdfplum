# Triggering the function

You can start testing this extension right away.

1. Go to your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${STORAGE_BUCKET}/files) in Firebase console.

1. Upload `demo.zip` from [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples) into bucket `${STORAGE_BUCKET}`.

1. Run this command:

   ```bash
    wget "https://${param:LOCATION}-${PROJECT_ID}.cloudfunctions.net/ext-${EXT_INSTANCE_ID}-executePdfGeneratorHttp?templatePath=${STORAGE_BUCKET}/demo.zip&outputFileName=demo.pdf&chromiumPdfOptions[format]=a5&chromiumPdfOptions[printBackground]=true&adjustHeightToFit=no&data[text]=Lorem ipsum dolor sit amet consectetur adipisicing elit.&data[flag]=OK&data[articles][0][title]=ABCD&data[articles][0][content]=Abcd content&data[articles][1][title]=EFGH&data[articles][1][content]=Efgh content&data[articles][2][title]=IJKL&data[articles][2][content]=Ijkl content&data[articles][3][title]=MNOP&data[articles][3][content]=Mnop content&data[articles][4][title]=QRST&data[articles][4][content]=Qrst content&data[colors][warm][0]=Red&data[colors][warm][1]=Yellow&data[colors][warm][2]=Orange&data[colors][cold][0]=Green&data[colors][cold][1]=Blue&data[colors][cold][2]=Gray&data[info][Age]=38&data[info][Name]=John Doe&data[info][Birthday]=1985%2F20%2F06&data[info][Address]=Silicon Valley" -O demo.pdf
   ```

   If [`RETURN_PDF_IN_RESPONSE`](https://github.com/pdfplum/pdfplum/tree/main/pdf-generator/PREINSTALL.md#returnpdfinresponse-required) is set, the PDF file will be stored as `demo.pdf` in your filesystem, otherwise you better change `... -O demo.pdf` to `... -O info.json`, because the response will contain general information about the generated PDF file in JSON format.

   If [`OUTPUT_STORAGE_BUCKET`](https://github.com/pdfplum/pdfplum/tree/main/pdf-generator/PREINSTALL.md#outputstoragebucket-optional) extension parameter is provided, the generated PDF file will also be stored in Firebase Storage under `${param:OUTPUT_STORAGE_BUCKET}/demo.pdf`. You can check it in your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${param:OUTPUT_STORAGE_BUCKET}/files).

# Documentation

- Get parameters are documented [here](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PREINSTALL.md#get-parameters).
- Extension parameters are documented [here](https://github.com/pdfplum/pdfplum/tree/main/http-pdf-generator/PREINSTALL.md#firebase-extension-parameters).
- You can find sample invocations of the endpoint [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples).
