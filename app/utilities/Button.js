function Button({ onClick, children, disabled, type = 'button', extraClasses = '' }) {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 self-end ${extraClasses}`}
    >
      {children}
    </button>
  );
}

export default Button;
