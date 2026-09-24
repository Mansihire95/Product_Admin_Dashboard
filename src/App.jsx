import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductFormPage from './pages/ProductFormPage';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <BrowserRouter>
      <ProductProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Redirect root to products */}
          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* Protected product routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ProductProvider>
    </BrowserRouter>
  );
};

export default App;
