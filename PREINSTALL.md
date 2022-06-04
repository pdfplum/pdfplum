Use this extension to generate PDF files using Google Docs PDF conversion API. 
This extension will listen to a collection in Firestore, and when document 
inserts happen it'll call the Google Dco API to generate a PDF based on a 
template provided and the values in the Firestore document. The generated PDF 
file will be stored in a Firebase Storage bucket and the link will be added 
back to document. 

## Additional setup
Before installing this extension, you'll need to:

- [Set up Cloud Firestore in your Firebase project.](https://firebase.google.com/docs/firestore/quickstart)
- [Set up API access to Google Docs API] (???)
- Create a template [Guide](????)

The templates in this extension are based on handlebars.js and can be configured
via the means provided in this framework. 

There are a few sample template docs created which you could copy and start using 
or use as inspiration to build your own templates. 
