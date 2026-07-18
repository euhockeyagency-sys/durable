const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

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
    const ext = path.extname(filePath);
    const headers = {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=604800",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "SAMEORIGIN",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    };
    const compressible = [".html", ".css", ".js", ".svg", ".txt", ".xml"].includes(ext);
    if (compressible && /gzip/.test(request.headers["accept-encoding"] || "")) {
      zlib.gzip(body, (gzipError, compressed) => {
        if (gzipError) {
          response.writeHead(200, headers);
          response.end(body);
          return;
        }
        response.writeHead(200, { ...headers, "Content-Encoding": "gzip", "Vary": "Accept-Encoding" });
        response.end(compressed);
      });
      return;
    }
    response.writeHead(200, headers);
    response.end(body);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Euro Hockey Agency website listening on port ${port}`);
});
