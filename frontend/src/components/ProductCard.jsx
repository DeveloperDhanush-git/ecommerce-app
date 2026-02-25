function ProductCard({ title, image, price, rating, description }) {
  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition duration-200 flex flex-col">
      {/* Product Image */}
      <div className="h-48 flex items-center justify-center mb-3">
        <img src={image} alt={title} className="h-full object-contain" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium line-clamp-2 mb-2">{title}</h3>
      <p className="text-gray-500 text-xs">{description}</p>

      {/* Rating */}
      <div className="flex items-center text-yellow-500 text-sm mb-1">
        {"★".repeat(rating)}
        <span className="text-gray-500 text-xs ml-1">({rating}.0)</span>
      </div>

      {/* Price */}
      <p className="text-lg font-semibold">₹{price}</p>
      {/* Add to Cart Button */}
      <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 py-1 rounded text-sm font-medium">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
