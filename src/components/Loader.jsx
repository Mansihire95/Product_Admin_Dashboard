import './Loader.css';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
