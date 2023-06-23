import React from 'react';
import DatePicker from 'react-datepicker';

function DateInput({ id, selected, onChange, isToday }) {
  return (
    <div className="relative date-input">
      <DatePicker 
        id={id}
        selected={selected}
        onChange={onChange}
        required
        className={`input text-center text-4xl w-full p-2 border-2 border-gray-300 rounded ${selected ? "filled" : ""}`}
      />
      <label htmlFor={id} className="absolute left-0 top-0 label-float">{isToday ? "Today" : "Date"}</label>
    </div>
  );
}


export default DateInput;
