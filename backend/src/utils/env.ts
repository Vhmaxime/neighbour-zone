import { constants } from "../config/index.js";

function getEnvironment() {
  return constants.vercelEnv || "development";
}

function getBaseUrl() {
  if (constants.vercelEnv === "production") {
    return `https://${constants.vercelProduction}`;
  }
  if (constants.vercelEnv === "preview") {
    return `https://${constants.vercelUrl}`;
  }
  return `http://localhost:3000`;
}

export { getEnvironment, getBaseUrl };
