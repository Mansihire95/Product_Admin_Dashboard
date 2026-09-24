import { Link } from 'react-router-dom';
import './ProductTable.css';

const ProductTable = ({ products, onDelete }) => {
  return (
    <div className="table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const image = product.thumbnail || (product.images && product.images[0]) || '';
            return (
              <tr key={product.id}>
                <td>
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      className="table-product-image"
                    />
                  ) : (
                    <div className="table-image-placeholder">N/A</div>
                  )}
                </td>
                <td className="product-title-cell">{product.title}</td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td className="price-cell">${Number(product.price).toFixed(2)}</td>
                <td>⭐ {Number(product.rating).toFixed(1)}</td>
                <td>{product.stock}</td>
                <td>
                  <div className="table-actions">
                    <Link to={`/products/${product.id}`} className="btn btn-sm btn-secondary">
                      View
                    </Link>
                    <Link to={`/products/${product.id}/edit`} className="btn btn-sm btn-primary">
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(product)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
