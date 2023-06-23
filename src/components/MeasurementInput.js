import React, { useEffect, useRef } from 'react';

function MeasurementInput({ value, onChange, placeholder, min, max }) {
  const inputRef = useRef(null);
  
  useEffect(() => {
    const ctrl = inputRef.current;
    let startPos;
    let startVal;

    const mouseMoveHandler = function(e) {
      const delta = Math.ceil(e.clientX - startPos);      
      updateValue(startVal, delta);
    };

    const touchMoveHandler = function(e) {
      const delta = Math.ceil(e.touches[0].clientX - startPos);        
      updateValue(startVal, delta);
    };

    const updateValue = function(initialVal, delta) {
      const incVal = Math.round(Math.sign(delta) * Math.pow(Math.abs(delta)/10, 1.6));
      const newVal = initialVal + incVal;
      
      if(newVal < 0) return;
      if (Math.abs(incVal)>1) {
        onChange({target: {value: newVal}});
      }
    }

    const mouseDownHandler = function(e) {
      startPos = e.clientX;
      startVal = parseFloat(ctrl.value);
      if (isNaN(startVal)) startVal = 0;
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    const touchStartHandler = function(e) {
      startPos = e.touches[0].clientX;
      startVal = parseFloat(ctrl.value);
      if (isNaN(startVal)) startVal = 0;
      document.addEventListener('touchmove', touchMoveHandler);
      document.addEventListener('touchend', touchEndHandler);
    };

    const mouseUpHandler = function() {
      document.removeEventListener('mousemove', mouseMoveHandler); 
    };

    const touchEndHandler = function() {
      document.removeEventListener('touchmove', touchMoveHandler); 
    };

    ctrl.addEventListener('mousedown', mouseDownHandler);
    ctrl.addEventListener('touchstart', touchStartHandler);

    // cleanup function
    return () => {
      ctrl.removeEventListener('mousedown', mouseDownHandler);
      ctrl.removeEventListener('touchstart', touchStartHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);
    }
  }, [onChange]);

  return (
    <input 
      ref={inputRef}
      type="number"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      min={min}
      max={max}
      required
      className="text-4xl w-full p-2 border-2 border-gray-300 rounded"
    />
  );
}

export default MeasurementInput;
