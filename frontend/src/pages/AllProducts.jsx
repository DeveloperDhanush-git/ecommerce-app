import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [productsPerPage, setProductsPerPage] = useState(8);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔥 Force ?page=1 if missing
  useEffect(() => {
    if (!searchParams.get("page")) {
      setSearchParams({
        page: 1,
        search: searchQuery,
      });
    }
  }, []);

  // Sync state with URL
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/products?page=${currentPage}&limit=${productsPerPage}&search=${searchQuery}`,
      );

      setProducts(res.data.products);
      setTotalProducts(res.data.total);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, productsPerPage, searchQuery]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  return (
    <div className="pt-20 bg-gray-100 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">All Products</h2>
      {searchQuery && (
        <p className="mb-4 text-sm text-gray-700">
          Showing results for
          <span className="font-semibold"> "{searchQuery}" </span>
        </p>
      )}

      <p className="text-sm mb-4 text-gray-600">
        Showing {totalProducts === 0 ? 0 : startIndex + 1}–
        {Math.min(endIndex, totalProducts)} of {totalProducts} products
      </p>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.prodid}
                title={product.proname}
                image={product.image}
                price={product.price}
                description={product.description}
                rating={4}
              />
            ))}
          </div>

          <hr className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Products per page:</span>
              <select
                value={productsPerPage}
                onChange={(e) => {
                  setSearchParams({
                    page: 1,
                    search: searchQuery,
                  });
                  setProductsPerPage(Number(e.target.value));
                }}
                className="border px-3 py-1 rounded"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setSearchParams({
                  page,
                  search: searchQuery,
                });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default AllProducts;
