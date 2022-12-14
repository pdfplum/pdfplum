# Post-installation configuration

Before you can use this extension, you'll need to update your security rules and add some code to your JavaScript app.

## Update security rules

Update your Firebase Storage security rules to allow reads from template path:

```proto
match /b/${STORAGE_BUCKET}/o {
  // Allow access to the template path only
  // use "/{allPaths=**}" to access to all paths in this bucket
  match /<TEMPLATE_ID> {
    allow read;
  }
}
```

If `OUTPUT_STORAGE_BUCKET` extension parameter is set, you need to allow writes to where generated
pdf files are going to be stored too:

```proto
match /b/${param:OUTPUT_STORAGE_BUCKET}/o {
  // Allow access to the generated pdf file path
  match /{outputs_path} {
    allow write;
  }
}
```

Check [here](https://firebase.google.com/docs/storage/security) for more information about security rules.

## Executing the function

You can start testing this extension right away.

1. Go to your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${STORAGE_BUCKET}/files) in Firebase console.

1. Upload `demo.zip` from [here](https://github.com/sassanh/template-to-pdf/tree/main/template-samples) into bucket `${STORAGE_BUCKET}`.

1. Run this command:

   ```bash
    wget "https://${param:LOCATION}-${PROJECT_ID}.cloudfunctions.net/ext-${EXT_INSTANCE_ID}-executePdfGenerator?templatePath=${STORAGE_BUCKET}/demo.zip&outputFileName=demo.pdf&chromiumPdfOptions[format]=a5&chromiumPdfOptions[printBackground]=true&adjustHeightToFit=no&data[text]=Lorem ipsum dolor sit amet consectetur adipisicing elit.&data[flag]=OK&data[articles][0][title]=ABCD&data[articles][0][content]=Abcd content&data[articles][1][title]=EFGH&data[articles][1][content]=Efgh content&data[articles][2][title]=IJKL&data[articles][2][content]=Ijkl content&data[articles][3][title]=MNOP&data[articles][3][content]=Mnop content&data[articles][4][title]=QRST&data[articles][4][content]=Qrst content&data[colors][warm][0]=Red&data[colors][warm][1]=Yellow&data[colors][warm][2]=Orange&data[colors][cold][0]=Green&data[colors][cold][1]=Blue&data[colors][cold][2]=Gray&data[info][Age]=38&data[info][Name]=John Doe&data[info][Birthday]=1985%2F20%2F06&data[info][Address]=Silicon Valley" -O demo.pdf
   ```

   If `RETURN_PDF_IN_RESPONSE` is set, the pdf file will be stored as `demo.pdf` in your filesystem.

   If `OUTPUT_STORAGE_BUCKET` extension parameter is provided, the generated pdf will also be stored in Firebase Storage under `${param:OUTPUT_STORAGE_BUCKET}/demo.pdf`. You can check it in your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${param:OUTPUT_STORAGE_BUCKET}/files).

## Documentation

- Get parameters are documented [here](https://github.com/sassanh/template-to-pdf/tree/main/pdf-generator/PREINSTALL.md#get-parameters).
- Extension parameters are documented [here](https://github.com/sassanh/template-to-pdf/tree/main/pdf-generator/PREINSTALL.md#firebase-extension-parameters).
- You can find sample invocations of the endpoint [here](https://github.com/sassanh/template-to-pdf/tree/main/template-samples).
