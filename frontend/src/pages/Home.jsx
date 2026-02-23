import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import CategoryCard from "../components/CategoryCard";
import Pagination from "../components/Pagination";

function Home() {

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [categoriesPerPage, setCategoriesPerPage] = useState(8);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/categories?page=${currentPage}&limit=${categoriesPerPage}`
      );

      setCategories(res.data.categories);
      setTotalCategories(res.data.total);

    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, categoriesPerPage]);

  const totalPages = Math.ceil(totalCategories / categoriesPerPage);

  return (
    <div className="pt-20 bg-gray-100 min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-4">
        Shop by Category
      </h2>

      <p className="text-sm mb-4 text-gray-600">
        Showing {(currentPage - 1) * categoriesPerPage + 1} –
        {Math.min(currentPage * categoriesPerPage, totalCategories)} of {totalCategories} categories
      </p>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.catid}
                id={cat.catid}
                title={cat.catname}
                image={cat.image}
                description={cat.description}
              />
            ))}
          </div>

          <hr className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Categories per page:
              </span>
              <select
                value={categoriesPerPage}
                onChange={(e) => {
                  setSearchParams({ page: 1 });
                  setCategoriesPerPage(Number(e.target.value));
                }}
                className="border px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                if (page >= 1 && page <= totalPages) {
                  setSearchParams({ page }); // 🔥 THIS UPDATES URL
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />

          </div>
        </>
      )}
    </div>
  );
}

export default Home;
