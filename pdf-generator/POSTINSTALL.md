You can start testing this extension right away. 

1. Create a template based on this [guide](./PREINSTALL.md). Make note of the Handlebars.js parameters you've 
used in the template, as they should match the request you create in the next step.  
1. Create an HTTP request to 
[https://${param:LOCATION}-${param:PROJECT_ID}.cloudfunctions.net/ext-${param:EXTENSION_ID}-executePdfGenerator](). 
Appemd the URL with query parameters that match the Handlebars.js 
parameters you've used in the template. You can serialize nested JS object including arrays, it is described [here](https://www.npmjs.com/package/qs).
1. Your generated file will be stored in Firebase Storage under 
`${param:OUTPUT_STORAGE_BUCKET}/${param:TEMPLATE_STORAGE_BUCKET}`. If you've configured the 
`${param:RETURN_PDF_IN_RESPONSE}`, the result will also be returned to the HTTP response.

Checkout [main page](..) for more details.
