import dotenv from "dotenv";
import { Client } from "@elastic/elasticsearch";

dotenv.config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
});

const createIndex = async () => {
  try {
    const exists = await client.indices.exists({ index: "products" });

    if (exists) {
      await client.indices.delete({ index: "products" });
      console.log("Old index deleted");
    }

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
            proname: {
              type: "text",
              analyzer: "custom_analyzer",
            },
            description: {
              type: "text",
              analyzer: "custom_analyzer",
            },
            price: { type: "float" },
            catid: { type: "integer" },
            dateinserted: { type: "date" },
          },
        },
      },
    });

    console.log("✅ Synonym-enabled index created");
  } catch (error) {
    console.error(error);
  }
};

createIndex();
