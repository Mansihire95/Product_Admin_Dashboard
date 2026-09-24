const ALLOWED_PAGE_SIZES = [10, 20,50];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// Safely parse an integer from a string; returns fallback if invalid
const safeInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parse and validate all URL query parameters.
 * Invalid values are normalized to safe defaults so the app never crashes.
 */
export const parsePageParams = (searchParams) => {
  // page: must be >= 1
  let page = safeInt(searchParams.get('page'), DEFAULT_PAGE);
  if (page < 1) page = DEFAULT_PAGE;

  // pageSize: must be one of the allowed values
  let pageSize = safeInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
  if (!ALLOWED_PAGE_SIZES.includes(pageSize)) pageSize = DEFAULT_PAGE_SIZE;

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  // sort format: "field-direction", e.g. "price-asc"
  const sort = searchParams.get('sort') || '';
  return { page, pageSize, search, category, sort };
};

/**
 * Parse sort string "price-asc" into { sortBy: "price", order: "asc" }
 */
export const parseSortParam = (sort) => {
  if (!sort) return { sortBy: '', order: '' };
  const parts = sort.split('-');
  /*split('-') separates the sort string into the field and direction, 
  then parts[0] gives the field and parts[1] gives the sorting order. */
  if (parts.length !== 2) return { sortBy: '', order: '' };
  return { sortBy: parts[0], order: parts[1] };
};

/**
 * Clamp page to last valid page if it exceeds total pages.
 * Returns corrected page number.
 * 
 * 
 * 
 * clampPage() makes sure the requested page is valid. If there are no items, it returns page 1. 
 * Otherwise, it calculates the last available page and returns that page if the requested page 
 * is greater than it. If the requested page is already valid, it returns the same page.
 */
export const clampPage = (page, total, pageSize) => {
  if (total === 0) return 1;
  const maxPage = Math.ceil(total / pageSize);
  if (page > maxPage) return maxPage;
  return page;
};

export const ALLOWED_PAGE_SIZES_LIST = ALLOWED_PAGE_SIZES;

/*URL
 ↓
parsePageParams()
 ↓
page, pageSize, search, category, sort
 ↓
parseSortParam()
 ↓
sortBy + order
 ↓
fetch/filter/sort products
 ↓
clampPage()
 ↓
make sure page is within the available pages




que : why export is used : 
=====>
  Because they are utility functions that may be needed in different components/files.
Because export allows other JavaScript files to use that function.
*/