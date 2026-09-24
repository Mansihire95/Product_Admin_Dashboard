import { useState, useEffect } from 'react';
import { validateProduct } from '../utils/validation';
import './ProductForm.css';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  rating: '',
  thumbnail: '',
};

const ProductForm = ({ initialData, onSubmit, isLoading, categories = [] }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        price: initialData.price ?? '',
        stock: initialData.stock ?? '',
        rating: initialData.rating ?? '',
        thumbnail: initialData.thumbnail || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateProduct(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      rating: Number(form.rating) || 0,
      thumbnail: form.thumbnail.trim(),
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          className={errors.title ? 'input-error' : ''}
          placeholder="Product title"
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className={errors.description ? 'input-error' : ''}
          placeholder="Product description"
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          {categories.length > 0 ? (
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={errors.category ? 'input-error' : ''}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.slug || cat} value={cat.slug || cat}>
                  {cat.name || cat}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="category"
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              className={errors.category ? 'input-error' : ''}
              placeholder="e.g. smartphones"
            />
          )}
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price * ($)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className={errors.price ? 'input-error' : ''}
            placeholder="0.00"
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="stock">Stock *</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            className={errors.stock ? 'input-error' : ''}
            placeholder="0"
          />
          {errors.stock && <span className="field-error">{errors.stock}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (0–5)</label>
          <input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={handleChange}
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="thumbnail">Image URL</label>
        <input
          id="thumbnail"
          name="thumbnail"
          type="url"
          value={form.thumbnail}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {form.thumbnail && (
        <div className="form-preview">
          <img src={form.thumbnail} alt="Preview" onError={(e) => (e.target.style.display = 'none')} />
        </div>
      )}

      <div className="form-submit">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
