/**
 * Validate product form fields.
 * Returns an errors object. Empty object means no errors.
 */
export const validateProduct = ({ title, description, category, price, stock }) => {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!description || !description.trim()) {
    errors.description = 'Description is required.';
  }

  if (!category || !category.trim()) {
    errors.category = 'Category is required.';
  }

  if (price === '' || price === undefined || price === null) {
    errors.price = 'Price is required.';
  } else if (isNaN(Number(price)) || Number(price) < 0) {
    errors.price = 'Price must be a number >= 0.';
  }

  if (stock === '' || stock === undefined || stock === null) {
    errors.stock = 'Stock is required.';
  } else if (isNaN(Number(stock)) || Number(stock) < 0) {
    errors.stock = 'Stock must be a number >= 0.';
  }

  return errors;
};
/*
=== means strict equality.

It checks:    Value AND data type must be the same.


Whereas == does type conversion before comparing.

Example:
5 == "5"

is:true
    because JavaScript converts "5" to 5.
*/