import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure hardcoded admin user exists
  const adminEmail = "odoo-hackathon@gmail.com";
  const adminPassword = "odoo-hackathon";
  const existingAdmin = await storage.getUserByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await storage.createUser({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      isPublic: false,
    } as any);
    log("Hardcoded admin user created: " + adminEmail);
  } else {
    // Always update password and admin status to guarantee login
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await storage.updateUser(existingAdmin.id, { password: hashedPassword, isAdmin: true } as any);
    log("Hardcoded admin user updated: " + adminEmail);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment port or default to 5000
  const port = process.env.PORT || 5000;
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
  
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
