import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static assets from Vite's build directory (dist)
app.use(express.static(path.join(__dirname, "dist")));

// API health diagnostics route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
  });
});

// Fallback all other routes to index.html for React Router client routing
app.get("/*all", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Learn Stock Node.js Server initialized`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
