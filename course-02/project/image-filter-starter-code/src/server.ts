import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

/**
 * @see https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url/22648406#22648406
 * 
 * @param uri - URI to validate 
 * @returns true if uri is valid else false
 */
function isValidURI(uri: string): boolean {
  var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');

  return uri.length < 2083 && url.test(uri);
}

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    
  //    1. validate the image_url query ✔️
  //    2. call filterImageFromURL(image_url) to filter the image ✔️
  //    3. send the resulting file in the response ✔️
  //    4. deletes any files on the server on finish of the response ✔️
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (req, res) => {
    const image_url:string = req.query.image_url;

    // Validate if image_url exists
    if (!image_url) {
      return res.status(400).send({
        message: "Please provide image url `GET /filteredimage?image_url={{URL}}`",
        success: false,
        data: null
      });
    }

    // Validate if image_url is a valid url
    if (!isValidURI(image_url)) {
      return res.status(400).send({
        message: "Please provide valid url for param image_url",
        success: false,
        data: null
      });
    }

    // Process the image
    await filterImageFromURL(image_url)
      .then(result => {
        res.sendFile(result, (err) => {
            if(err){
              res.status(500).send({
                message: "An error occurred while processing your request, we could not process the image.",
                success: false,
                data: null
              });
            }

            // Delete file
            deleteLocalFiles([result]);
        });

        return;
      })
      .catch(error => {
        // console.error(error);
        return res.status(500).send({
          message: "An error occurred while processing your request, ensure that image_url point to a correct image.",
          success: false,
          data: null
        });
      });
  });
  // END function

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();