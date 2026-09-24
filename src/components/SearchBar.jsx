import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search products...' }) => {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} title="Clear search">
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
