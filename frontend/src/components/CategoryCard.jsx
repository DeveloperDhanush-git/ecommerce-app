import { useNavigate } from "react-router-dom";

function CategoryCard({ id, title, image, description }) {
  const navigate = useNavigate();

  const slug = title.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-");

  return (
    <div
      onClick={() => navigate(`/category/${slug}/${id}?page=1`)}
      className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer transition duration-200"
    >
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      <div className="h-40 flex items-center justify-center overflow-hidden">
        <img src={image} alt={title} className="object-contain h-full" />
      </div>

      {description && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
      )}

      <p className="text-blue-600 text-sm mt-3 hover:underline">See more</p>
    </div>
  );
}

export default CategoryCard;
