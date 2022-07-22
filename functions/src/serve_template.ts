import http from "http";

import serveStatic from "serve-static";

// eslint-disable-next-line require-jsdoc
export async function serveTemplate(path: string): Promise<number> {
  const serve = serveStatic(path);

  const server = http.createServer(function (req, res) {
    serve(req, res, () => undefined);
  });

  const getPort = (await import("get-port")).default;
  const portNumber = await getPort();

  server.listen(portNumber);

  return portNumber;
}
