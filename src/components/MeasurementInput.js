import React from 'react';

function MeasurementInput({ id, value, onChange, placeholder, min, max }) {
  return (
    <div className="relative">
      <input 
        id={id}
        type="text"
        value={value}
        placeholder=" "
        onChange={onChange}
        min={min}
        max={max}
        required
        pattern="\d+(\.5)?"
        className={`input text-center text-4xl w-full p-2 border-2 border-gray-300 rounded ${value ? "filled" : ""}`}
      />
      <label htmlFor={id} className="absolute left-0 top-0 label-float">{placeholder}</label>
    </div>
  );
}

export default MeasurementInput;
