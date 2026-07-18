const { createApp } = require("./src/app");
const { loadConfig } = require("./src/config");

const config = loadConfig(process.env);
const app = createApp({ config });

app.listen(config.port, "0.0.0.0", () => {
  const state = config.applicationConfigured ? "enabled" : "disabled (missing environment variables)";
  console.log(`Euro Hockey Agency listening on port ${config.port}; applications ${state}`);
});
