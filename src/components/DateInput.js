import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

function CustomInput({ value, onClick, className, onChange }) {
  const id = "custom-date-input"; // or any other unique id
  const isToday = value && new Date(value).toDateString() === new Date().toDateString();
  
  return (
    <div className={`relative date-input ${value ? "filled" : ""}`}>
      <input 
        id={id}
        className={`input text-center text-2xl w-full p-2 border-2 border-gray-300 rounded ${value ? "filled" : ""}`}
        onClick={onClick}
        onChange={onChange}
        value={value}
      />
      <label htmlFor={id} className={`absolute left-0 top-0 label-float ${value ? "filled" : ""}`}>{isToday ? "Date (Today)" : "Date"}</label>
    </div>
  )
}

function DateInput({ selected, onChange }) {
  const handleChangeRaw = (e) => {
    const date = moment(e.target.value, 'MM/DD/YYYY', true);
    
    if (date.isValid()) {
      onChange(date.toDate());
    }
  };

  return (
    <DatePicker 
      selected={selected}
      onChange={onChange}
      onChangeRaw={handleChangeRaw}
      dateFormat="MM/dd/yyyy"
      required
      customInput={<CustomInput onClick={handleChangeRaw} />}
    />
  );
}

export default DateInput;
