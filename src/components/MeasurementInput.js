import React from 'react';

function MeasurementInput({ value, onChange, placeholder, min, max }) {
  const handleInputChange = (e) => {
    if (e.target.validity.valid) onChange(e);
  };

  return (
    <input 
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={handleInputChange}
      min={min}
      max={max}
      required
      pattern="\d+(\.5)?"
      className="text-center text-4xl w-full p-2 border-2 border-gray-300 rounded"
    />
  );
}

export default MeasurementInput;
