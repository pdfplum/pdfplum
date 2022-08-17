# Post-installation configuration

Before you can use this extension, you'll need to update your security rules and add some code to your JavaScript app.

## Update security rules

Update your Firebase Storage security rules to allow reads from template path:

    match /b/${STORAGE_BUCKET}/o {
      // Allow access to the template path only
      // use "/{allPaths=**}" to access to all paths in this bucket
      match /<TEMPLATE_ID> {
        allow read;
      }
    }

If `OUTPUT_STORAGE_BUCKET` is set, you need to allow writes to where generated pdf files are going to be stored too:

    match /b/${param:OUTPUT_STORAGE_BUCKET}/o {
      // Allow access to the generated pdf file path
      match /{outputs_path} {
        allow write;
      }
    }

Check [here](https://firebase.google.com/docs/storage/security) for more information about security rules.

---

## Executing the function

You can start testing this extension right away.

1.  Create a template based on this [guide](https://github.com/sassanh/template-to-pdf/blob/main/pdf-generator/PREINSTALL.md). Make note of the Handlebars.js parameters you've used in the template, as they should match the request you create in the next step.
2.  Create an HTTP request to [https://${param:LOCATION}-${PROJECT_ID}.cloudfunctions.net/ext-${PROJECT_ID}-executePdfGenerator]().
    Append the URL with query parameters that match the Handlebars.js parameters you've used in the template. You can serialize nested JS object including arrays, it is described [here](https://www.npmjs.com/package/qs).
3.  Your generated file will be stored in Firebase Storage under `${param:OUTPUT_STORAGE_BUCKET}/<OUTPUT_FILENAME>` where `<OUTPUT_FILENAME>` is the one provided in get parameters or if empty, it will be a uuid.
    If you've chosen to return a PDF in the response, the result will also be returned to the HTTP response.

Checkout [the repository](https://github.com/sassanh/template-to-pdf) for more details.
