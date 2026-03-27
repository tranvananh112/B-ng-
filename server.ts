import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for Sofascore Images
  app.get("/api/sofascore/image/team/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const url = `https://api.sofascore.app/api/v1/team/${id}/image`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Origin': 'https://www.sofascore.com',
          'Referer': 'https://www.sofascore.com/',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        return res.status(response.status).send('Image not found');
      }

      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      const cacheControl = response.headers.get('cache-control');
      if (cacheControl) {
        res.setHeader('Cache-Control', cacheControl);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.status(response.status).send(buffer);
    } catch (error: any) {
      console.error("Image proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy for Sport Radar API
  app.get("/api/sportradar/live-score", async (req, res) => {
    try {
      const { event_id } = req.query;
      if (!event_id) {
        return res.status(400).json({ error: "event_id is required" });
      }

      const url = `https://sport-radar-api.p.rapidapi.com/live/score-ui?event_id=${event_id}`;
      const response = await fetch(url, {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'sport-radar-api.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("SportRadar Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy for Sofascore API
  app.get("/api/sofascore/*", async (req, res) => {
    try {
      const targetPath = req.params[0];
      const url = `https://api.sofascore.com/api/v1/${targetPath}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.sofascore.com',
          'Referer': 'https://www.sofascore.com/',
          'Cache-Control': 'no-cache'
        }
      });

      const data = await response.text();
      
      res.status(response.status).send(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
