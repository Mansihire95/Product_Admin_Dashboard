import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onDelete }) => {
  const image = product.thumbnail || (product.images && product.images[0]) || '';

  return (
    <div className="product-card">
      <div className="card-image-wrap">
        {image ? (
          <img src={image} alt={product.title} className="card-image" />
        ) : (
          <div className="card-image-placeholder">No Image</div>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">{product.title}</h3>
        <span className="card-category">{product.category}</span>
        <div className="card-meta">
          <span className="card-price">${Number(product.price).toFixed(2)}</span>
          <span className="card-rating">⭐ {Number(product.rating).toFixed(1)}</span>
        </div>
        <div className="card-stock">
          Stock: <strong>{product.stock}</strong>
        </div>
        <div className="card-actions">
          <Link to={`/products/${product.id}`} className="btn btn-sm btn-secondary">
            View
          </Link>
          <Link to={`/products/${product.id}/edit`} className="btn btn-sm btn-primary">
            Edit
          </Link>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(product)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
