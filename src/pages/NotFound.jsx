import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="nf-content">
        <div className="nf-code">404</div>
        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/products" className="btn btn-primary">
          ← Back to Products
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
