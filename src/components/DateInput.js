import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { toast } from 'react-hot-toast';

function CustomInput({ value, onClick, className, onBlur, onChange }) {
  const id = "custom-date-input";
  
  return (
    <div className="relative">
      <input 
        id={id}
        className={`text-center text-xl w-full p-2 border-2 border-gray-300 rounded ${value ? 'text-80876E' : 'text-gray-600'}`}
        onClick={onClick}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
        autoComplete="off"
      />
      <label htmlFor={id} className={`absolute left-4 top-4 transition-all duration-200 ${value ? 'text-80876E' : 'text-gray-600'} text-sm`}>
        {"Date"}
      </label>
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
      customInput={<CustomInput value={inputValue} onBlur={handleBlur} onChange={handleInputChange} />}
      dateFormat="MM/dd/yyyy"
    />
  );
}

export default DateInput;
