import { serve } from "@hono/node-server";
import app from "./index.js";

const port = parseInt(process.env.PORT || "3080", 10);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Backend server is running on http://localhost:${info.port}`);
    console.log(`📚 API docs available at http://localhost:${info.port}/api/ui`);
  }
);
