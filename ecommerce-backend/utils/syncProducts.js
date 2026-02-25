import db from "../config/db.js";
import client from "../config/elasticsearch.js";

const syncProducts = async () => {
  try {
    console.log("Fetching products from MySQL...");

    const [products] = await db.query("SELECT * FROM products");

    if (!products.length) {
      console.log("No products found in DB");
      return;
    }

    console.log(`Found ${products.length} products`);

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

    console.log("✅ Products synced successfully to Elasticsearch");
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
};

syncProducts();
