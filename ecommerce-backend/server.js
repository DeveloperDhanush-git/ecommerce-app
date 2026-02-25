import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import client from "./config/elasticsearch.js";
import db from "./config/db.js";

dotenv.config();

const app = express();

// ─────────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────────

// Helmet — sets secure HTTP response headers
app.use(helmet());

// CORS — restrict to known frontend origin(s) only
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:80", "http://localhost"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl in dev)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Rate limiting — protect auth endpoints from brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use("/api/auth", authLimiter);

// Body parser
app.use(express.json({ limit: "10kb" })); // prevent large payload attacks

// ─────────────────────────────────────────────────────────────
// Health Check (must be before auth middleware)
// ─────────────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: "disconnected",
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Root info
app.get("/", (req, res) => {
  res.json({ message: "Ecommerce API is running", version: "1.0.0" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// Elasticsearch: create index + sync products on startup
// ─────────────────────────────────────────────────────────────
const setupElasticsearch = async () => {
  try {
    const exists = await client.indices.exists({ index: "products" });

    if (!exists) {
      await client.indices.create({
        index: "products",
        body: {
          settings: {
            analysis: {
              filter: {
                synonym_filter: {
                  type: "synonym",
                  synonyms: [
                    "mobile, mobiles, phone, phones, smartphone, smartphones",
                    "tv, television",
                    "laptop, notebook",
                    "earphones, earbuds, headphones, headset",
                    "fridge, refrigerator",
                    "ac, air conditioner",
                    "book, books",
                    "kitchen, cookware, utensils",
                  ],
                },
              },
              analyzer: {
                custom_analyzer: {
                  tokenizer: "standard",
                  filter: ["lowercase", "synonym_filter", "porter_stem"],
                },
              },
            },
          },
          mappings: {
            properties: {
              proname: { type: "text", analyzer: "custom_analyzer" },
              description: { type: "text", analyzer: "custom_analyzer" },
              price: { type: "float" },
              catid: { type: "integer" },
              dateinserted: { type: "date" },
            },
          },
        },
      });
      console.log("✅ Elasticsearch index 'products' created");
    } else {
      console.log("ℹ️  Elasticsearch index 'products' already exists");
    }

    // ⚠️  Fixed: select only needed columns, not SELECT *
    const [products] = await db.query(
      "SELECT prodid, proname, description, price, catid FROM products LIMIT 10000",
    );

    if (products.length > 0) {
      const body = [];
      products.forEach((product) => {
        body.push(
          { index: { _index: "products", _id: product.prodid } },
          {
            proname: product.proname,
            description: product.description,
            price: parseFloat(product.price),
            catid: product.catid,
          },
        );
      });

      await client.bulk({ refresh: true, body });
      console.log(`✅ Synced ${products.length} products to Elasticsearch`);
    } else {
      console.log("⚠️  No products found in DB to sync");
    }
  } catch (error) {
    console.error("❌ Elasticsearch setup failed:", error.message);
    // Don't crash the server — ES may not be critical for all routes
  }
};

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`[${new Date().toISOString()}] Server running on 0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"})`);
  await setupElasticsearch();
});

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown — drain existing connections before exit
// ─────────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[${signal}] Graceful shutdown initiated…`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await db.end(); // release MySQL pool
      console.log("MySQL pool closed.");
    } catch (e) {
      console.error("Error closing MySQL pool:", e.message);
    }
    process.exit(0);
  });

  // Force-exit after 15 s if connections don't drain
  setTimeout(() => {
    console.error("Graceful shutdown timeout — forcing exit.");
    process.exit(1);
  }, 15_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Catch unhandled promise rejections (prevent silent failures)
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
