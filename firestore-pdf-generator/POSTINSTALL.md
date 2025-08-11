# Usage

## Triggering the function

You can start testing this extension right away.

1. Go to your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${STORAGE_BUCKET}/files) in Firebase console.

1. Download `demo.zip` from [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples), and upload it to Firebase Storage under `${param:TEMPLATE_PATH}`.

1. Go to your [Firestore dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/firestore/databases/data/~2F${param:FIRESTORE_COLLECTION}) in Firebase console. If you are not using the default Firestore database, it will be located [here](https://console.firebase.google.com/project/${PROJECT_ID}/firestore/databases/${param:FIRESTORE_DATABASE}/data/~2F${param:FIRESTORE_COLLECTION}) instead.

1. Create a document with these values (type of each field is written in parenthesis in front of it, so `text=(string)...` means type of text is `string`):

   ```text
    text=(string)Lorem ipsum dolor sit amet consectetur adipisicing elit.
    flag=(string)OK
    articles=(array)
    articles[0]=(map)
    articles[0].title=(string)ABCD
    articles[0].content=(string)Abcd content
    articles[1]=(map)
    articles[1].title=(string)EFGH
    articles[1].content=(string)Efgh content
    articles[2]=(map)
    articles[2].title=(string)IJKL
    articles[2].content=(string)Ijkl content
    articles[3]=(map)
    articles[3].title=(string)MNOP
    articles[3].content=(string)Mnop content
    articles[4]=(map)
    articles[4].title=(string)QRST
    articles[4].content=(string)Qrst content
    colors=(map)
    colors.warm=(array)
    colors.warm[0]=(string)Red
    colors.warm[1]=(string)Yellow
    colors.warm[2]=(string)Orange
    colors.cold=(array)
    colors.cold[0]=(string)Green
    colors.cold[1]=(string)Blue
    colors.cold[2]=(string)Gray
    info=(map)
    info.Age=(number)38
    info.Name=(string)John Doe
    info.Birthday=(timestamp)1985/20/06
    info.Address=(string)Silicon Valley
    _pdfplum_config=(map)
    _pdfplum_config.templatePath=(string)${param:TEMPLATE_PATH}
    _pdfplum_config.outputFileName=(string)demo.pdf
    _pdfplum_config.chromiumPdfOptions=(map)
    _pdfplum_config.chromiumPdfOptions.printBackground=(boolean)true
    _pdfplum_config.adjustHeightToFit=(boolean)false
   ```

   The generated PDF file will be stored in Firebase Storage under `${param:OUTPUT_STORAGE_BUCKET}/demo.pdf`. You can check it in your [Firebase Storage dashboard](https://console.firebase.google.com/project/${PROJECT_ID}/storage/${param:OUTPUT_STORAGE_BUCKET}/files).

   You can go ahead and add this field to the same Firestore document:

   ```text
    _pdfplum_config.chromiumPdfOptions.format=(string)a5
   ```

   or edit any value in it, the generated PDF file should get regenerated based on the new values in a few seconds. It can be useful to fix a wrong value in an invoice or similar use-cases.

   If you prefer to keep the old PDF file for reference and create a new one instead of updating it in place, you can either duplicate the Firestore document with a new ID or change its [`outputFileName`](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PARAMETERS.md#outputfilename) value.

## Documentation

- Embedded parameters are documented [here](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PARAMETERS.md#embedded-parameters).
- Extension parameters are documented [here](https://github.com/pdfplum/pdfplum/tree/main/firestore-pdf-generator/PARAMETERS.md#firebase-extension-parameters).
- You can find sample invocations of the endpoint [here](https://github.com/pdfplum/pdfplum/tree/main/template-samples).
