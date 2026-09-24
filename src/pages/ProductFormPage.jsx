import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, addProduct, updateProduct } from '../api/productApi';
import { getCategories } from '../api/productApi';
import { useProducts } from '../context/ProductContext';
import Navbar from '../components/Navbar';
import ProductForm from '../components/ProductForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './ProductFormPage.css';

/*this page handles both add product and edit product */
const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Determine if we are in edit mode based on the presence of an ID in the URL
  const isEdit = Boolean(id);

  const { addProduct: contextAddProduct, editProduct: contextEditProduct, overrides } = useProducts();

  const [initialData, setInitialData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);// State to track if the form is currently being saved
  //prevents from double clicking for saving
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch categories
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // fetch product for editing
  useEffect(() => {
    if (!isEdit) return;
    const fetchForEdit = async () => {
      setLoading(true);
      setError('');
      try {
        // Check locally added products first
        const localAdded = overrides.addedProducts.find((p) => String(p.id) === String(id));
        if (localAdded) {
          setInitialData(localAdded);
          setLoading(false);
          return;
        }

        const data = await getProductById(id);
        // Apply any local edits
        const edited = overrides.editedProducts[data.id];
        setInitialData(edited || data);
      } catch (err) {
        setError(err.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchForEdit();
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    // Prevent double submit
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isEdit) {
        const localAdded = overrides.addedProducts.find((p) => String(p.id) === String(id));

        if (localAdded) {
          // Product is local-only — no real API entry exists, just update context
          const finalProduct = { ...localAdded, ...formData, id: localAdded.id };
          contextEditProduct(finalProduct);
        } else {
          // Real API product — call the API then update context
          await updateProduct(id, formData);
          const finalProduct = { ...initialData, ...formData, id: Number(id) };
          contextEditProduct(finalProduct);
        }

        setSuccessMessage('Product updated successfully!');
        setTimeout(() => navigate(`/products/${id}`), 1200);//Wait 1.2 seconds, then go to product details page.
      } else {
        //if edit is false, then we are adding a new product. We call the API to add the product,
        //  but we also create a local product with a unique ID and add it to the context.
        await addProduct(formData); // still call API so request goes through
        const newProduct = {
          ...formData,
          id: Date.now(), // guaranteed unique local ID
          images: formData.thumbnail ? [formData.thumbnail] : [],
          reviews: [],
        };
        contextAddProduct(newProduct);
        setSuccessMessage('Product added successfully!');
        setTimeout(() => navigate('/products'), 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <><Navbar /><Loader text="Loading product..." /></>;

  return (
    <div className="form-page">
      <Navbar />
      <main className="form-main">
        <div className="form-header">
          <Link to={isEdit ? `/products/${id}` : '/products'} className="back-link">
            ← {isEdit ? 'Back to Product' : 'Back to Products'}
          </Link>
          <h1 className="form-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>

        <div className="form-card">
          {successMessage && (
            <div className="success-banner">{successMessage}</div>
          )}
          {error && (
            <div className="error-banner">{error}</div>
          )}

          <ProductForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            categories={categories}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductFormPage;
