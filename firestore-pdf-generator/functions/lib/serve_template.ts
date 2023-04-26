import http from "http";
import {getPort} from 'get-port-please';

import serveStatic from "serve-static";

/**
 * Serves a directory on a free port in localhost.
 */
export async function serveTemplate({
  path,
}: {
  path: string;
}): Promise<number> {
  const serve = serveStatic(path, { dotfiles: "allow", fallthrough: false });

  const server = http.createServer(function (request, response) {
    serve(request, response, () => {
      response.statusCode = 404;
      response.statusMessage = "Not Found";
      response.end("");
    });
  });

  const portNumber = await getPort({port: 3000, portRange: [3000, 5000]});

  server.listen(portNumber);

  return portNumber;
}
