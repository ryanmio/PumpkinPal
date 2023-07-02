import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { toast } from 'react-hot-toast';

function CustomInput({ value, onClick, className, onBlur, onChange }) {
  const id = "custom-date-input"; // or any other unique id
  const isToday = value && new Date(value).toDateString() === new Date().toDateString();
  
  return (
    <div className={`relative date-input ${value ? "filled" : ""}`}>
      <input 
        id={id}
        className={`input text-center text-2xl w-full p-2 border-2 border-gray-300 rounded ${value ? "filled" : ""}`}
        onClick={onClick}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
      />
      <label htmlFor={id} className={`absolute left-0 top-0 label-float ${value ? "filled" : ""}`}>{isToday ? "Date (Today)" : "Date"}</label>
    </div>
  )
}

function DateInput({ selected, onChange }) {
  const [inputValue, setInputValue] = useState(moment(selected).format("MM/DD/YYYY"));
  
  const handleBlur = (e) => {
    const value = e.target.value;
    if (!moment(value, "MM/DD/YYYY", true).isValid()) {
      toast.error("Invalid date. Please use MM/DD/YYYY format.");
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }
  
  const handleDateChange = (date) => {
    setInputValue(moment(date).format("MM/DD/YYYY"));
    onChange(date);
  }

  return (
    <DatePicker 
      selected={selected}
      onChange={handleDateChange}
      required
      customInput={<CustomInput onBlur={handleBlur} onChange={handleInputChange} />}
      dateFormat="MM/dd/yyyy"
    />
  );
}

export default DateInput;
