import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

function CategoryProducts() {
  const { categoryName, id } = useParams(); // 🔥 get id
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [productsPerPage] = useState(8);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  const fetchProducts = async () => {
    try {
      const res = await api.get(
        `/api/products?catid=${id}&page=${currentPage}&limit=${productsPerPage}`,
      );

      setProducts(res.data.products);
      setTotalProducts(res.data.total);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="pt-20 bg-gray-100 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4 capitalize">
        {categoryName.replace(/-/g, " ")}
      </h2>

      {products.length === 0 ? (
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
                rating={4}
              />
            ))}
          </div>

          <hr className="my-8" />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setSearchParams({ page });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}

export default CategoryProducts;
