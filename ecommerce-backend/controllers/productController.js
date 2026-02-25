import client from "../config/elasticsearch.js";
import db from "../config/db.js";

export const searchProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || "";
    const catid = req.query.catid;
    const sort = req.query.sort || "relevance";

    const from = (page - 1) * limit;

    let cleanSearch = search.toLowerCase().trim();
    let priceRange = null;
    let categoryFilter = null;

    // 🔥 Extract price number-only search (e.g., "20000")
    if (/^\d+$/.test(cleanSearch)) {
      priceRange = {
        range: { price: { lte: parseInt(cleanSearch) } },
      };
      cleanSearch = "";
    }

    // 🔥 Under / Above
    const underMatch = cleanSearch.match(/under\s(\d+)/);
    const aboveMatch = cleanSearch.match(/above\s(\d+)/);

    if (underMatch) {
      priceRange = { range: { price: { lte: parseInt(underMatch[1]) } } };
      cleanSearch = cleanSearch.replace(/under\s\d+/, "").trim();
    }

    if (aboveMatch) {
      priceRange = { range: { price: { gte: parseInt(aboveMatch[1]) } } };
      cleanSearch = cleanSearch.replace(/above\s\d+/, "").trim();
    }

    // 🔥 Normalize helper
    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/&/g, " ")
        .replace(/and/g, " ")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

    const searchWords = normalize(cleanSearch).split(/\s+/);

    // 🔥 Fetch categories + synonyms using JOIN
    const [rows] = await db.query(`
  SELECT c.catid, c.catname, cs.synonym
  FROM categories c
  LEFT JOIN category_synonyms cs ON c.catid = cs.catid
`);

    let categoryMap = {};

    rows.forEach((row) => {
      if (!categoryMap[row.catid]) {
        categoryMap[row.catid] = {
          catname: row.catname,
          words: [],
        };
      }

      categoryMap[row.catid].words.push(normalize(row.catname));

      if (row.synonym) {
        categoryMap[row.catid].words.push(normalize(row.synonym));
      }
    });

    for (const catid in categoryMap) {
      const words = categoryMap[catid].words.flatMap((w) => w.split(/\s+/));

      const matched = searchWords.some((word) => words.includes(word));

      if (matched) {
        categoryFilter = { term: { catid: parseInt(catid) } };

        cleanSearch = searchWords
          .filter((word) => !words.includes(word))
          .join(" ");

        break;
      }
    }

    const mustQueries = [];
    const filterQueries = [];

    // 🔎 Full text search (reduced fuzziness)
    if (cleanSearch) {
      mustQueries.push({
        multi_match: {
          query: cleanSearch,
          fields: ["proname^4", "description^2"],
          fuzziness: "AUTO",
          minimum_should_match: "75%",
        },
      });
    }

    // Category filter from URL
    if (catid) {
      filterQueries.push({
        term: { catid: parseInt(catid) },
      });
    }

    // Category filter from search word
    if (categoryFilter) {
      filterQueries.push(categoryFilter);
    }

    // Price filter
    if (priceRange) {
      filterQueries.push(priceRange);
    }

    let sortOption = [];

    if (sort === "price_low") sortOption = [{ price: "asc" }];
    if (sort === "price_high") sortOption = [{ price: "desc" }];

    const result = await client.search({
      index: "products",
      from,
      size: limit,
      sort: sortOption.length ? sortOption : undefined,
      query: {
        bool: {
          must: mustQueries.length ? mustQueries : [{ match_all: {} }],
          filter: filterQueries,
        },
      },
    });

    const products = result.hits.hits.map((hit) => ({
      prodid: hit._id,
      ...hit._source,
    }));

    res.json({
      products,
      total: result.hits.total.value,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
};
