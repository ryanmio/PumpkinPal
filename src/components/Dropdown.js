import React, { useState, useRef, useEffect } from 'react';

function Dropdown({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const dropdownRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (toggleRef.current && !toggleRef.current.contains(event.target) && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button ref={toggleRef} type="button" onClick={() => setIsOpen(!isOpen)} className="inline-flex justify-center w-7 h-7 rounded-full bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="options-menu" aria-haspopup="true" aria-expanded="true">
          <span className="sr-only">Open options</span>
          {/* Icon when menu is closed. */}
          <svg className={`${isOpen ? 'hidden' : 'block'} h-5 w-5`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {/* Icon when menu is open. */}
          <svg className={`${isOpen ? 'block' : 'hidden'} h-5 w-5`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button type="button" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={onEdit}>Edit</button>
            <button type="button" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={onDelete}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
