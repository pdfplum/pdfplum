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

1. Upload `basic-example.zip` from [here](https://github.com/sassanh/template-to-pdf/tree/main/template-samples) into bucket `${STORAGE_BUCKET}`.

1. Run this command:

   ```bash
   wget "https://${param:LOCATION}-${PROJECT_ID}.cloudfunctions.net/ext-${EXT_INSTANCE_ID}-executePdfGenerator?templatePath=${STORAGE_BUCKET}/basic-example.zip&outputFileName=basic-example.pdf&chromiumPdfOptions[printBackground]=true&adjustHeightToFit=true&data[name]=World&data[title]=Title&data[articles][0][url]=wikipedia.org&data[articles][0][title]=Wikipedia&data[articles][1][url]=google.com&data[articles][1][title]=Google&data[description]=Description" -O basic-example.pdf

   ```

   If `RETURN_PDF_IN_RESPONSE` is set, the pdf file will be stored as `basic-example.pdf` in your filesystem.

   If `OUTPUT_STORAGE_BUCKET` extension parameter is provided, the generated pdf will also be stored in Firebase Storage under `${param:OUTPUT_STORAGE_BUCKET}/basic-example.pdf`. You can check it in your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${STORAGE_BUCKET}/files).

## Documentation

- Get parameters are documented [here](https://github.com/sassanh/template-to-pdf/tree/main/pdf-generator/PREINSTALL.md#get-parameters).
- Extension parameters are documented [here](https://github.com/sassanh/template-to-pdf/tree/main/pdf-generator/PREINSTALL.md#firebase-extension-parameters).
- You can find sample invocations of the endpoint [here](https://github.com/sassanh/template-to-pdf/tree/main/template-samples).
