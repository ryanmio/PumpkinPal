function Button({ onClick, children, disabled, type = 'button', extraClasses = '' }) {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-button hover:bg-green-button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-button ${extraClasses}`}
    >
      {children}
    </button>
  );
}

export default Button;
