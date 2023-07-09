import React from 'react';

function MeasurementInput({ id, value, onChange, placeholder, min, max }) {
  return (
    <div className="relative">
      <input 
        id={id}
        type="number"
        value={value}
        placeholder=" "
        onChange={onChange}
        min={min}
        max={max}
        step="0.5" // This line allows 0.5 increments
        required
        className={`input text-center text-2xl w-full p-2 border-2 border-gray-300 rounded ${value ? "filled" : ""}`}
      />
      <label htmlFor={id} className="label-float absolute left-0 top-0">{placeholder}</label>
    </div>
  );
}

export default MeasurementInput;
