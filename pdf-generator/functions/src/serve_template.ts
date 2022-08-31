import http from "http";

import serveStatic from "serve-static";

/**
 * Serves a directory on a free port in localhost
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

  const getPort = (await import("get-port")).default;
  const portNumber = await getPort();

  server.listen(portNumber);

  return portNumber;
}
