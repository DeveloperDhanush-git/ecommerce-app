import db from "../config/db.js";

export const getCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  try {
    const [categories] = await db.query(
      "SELECT * FROM categories LIMIT ? OFFSET ?",
      [limit, offset],
    );

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM categories",
    );

    res.json({
      categories,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
