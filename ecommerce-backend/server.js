import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import client from "./config/elasticsearch.js";
import db from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// Elasticsearch: create index + sync products on startup
// ─────────────────────────────────────────────────────────────
const setupElasticsearch = async () => {
  try {
    // Check if index already exists
    const exists = await client.indices.exists({ index: "products" });

    if (!exists) {
      // Create index with synonym-aware analyzer
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
                    "kitchen, cookware, utensils"
                  ]
                }
              },
              analyzer: {
                custom_analyzer: {
                  tokenizer: "standard",
                  filter: ["lowercase", "synonym_filter", "porter_stem"]
                }
              }
            }
          },
          mappings: {
            properties: {
              proname: { type: "text", analyzer: "custom_analyzer" },
              description: { type: "text", analyzer: "custom_analyzer" },
              price: { type: "float" },
              catid: { type: "integer" },
              dateinserted: { type: "date" }
            }
          }
        }
      });
      console.log("✅ Elasticsearch index 'products' created");
    } else {
      console.log("ℹ️  Elasticsearch index 'products' already exists");
    }

    // Sync all products from MySQL → Elasticsearch
    const [products] = await db.query("SELECT * FROM products");

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
          }
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

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await setupElasticsearch();
});
