import React from 'react';
import DatePicker from 'react-datepicker';

function CustomInput({ value, onClick, className }) {
  const id = "custom-date-input"; // or any other unique id
  const isToday = value && new Date(value).toDateString() === new Date().toDateString();
  
  return (
    <div className={`relative date-input ${value ? "filled" : ""}`}>
      <input 
        id={id}
        className={`input text-center text-2xl w-full p-2 border-2 border-gray-300 rounded ${value ? "filled" : ""}`}
        onClick={onClick}
        value={value}
      />
      <label htmlFor={id} className={`absolute left-0 top-0 label-float ${value ? "filled" : ""}`}>{isToday ? "Date (Today)" : "Date"}</label>
    </div>
  )
}

function DateInput({ selected, onChange }) {
  return (
    <DatePicker 
      selected={selected}
      onChange={onChange}
      required
      customInput={<CustomInput />}
    />
  );
}

export default DateInput;
