const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, "public");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const rawPath = request.url.split("?")[0];
  const pathname = rawPath === "/" ? "/index.html" : (path.extname(rawPath) ? rawPath : `${rawPath}.html`);
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const host = request.headers.host;
    const proto = request.headers["x-forwarded-proto"] || "http";
    const baseUrl = `${proto}://${host}`;
    let body = data;
    if ([".html", ".txt", ".xml"].includes(path.extname(filePath))) {
      body = Buffer.from(data.toString("utf8").replaceAll("{{BASE_URL}}", baseUrl));
    }
    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": path.extname(filePath) === ".html" ? "no-cache" : "public, max-age=3600"
    });
    response.end(body);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Euro Hockey Agency website listening on port ${port}`);
});
