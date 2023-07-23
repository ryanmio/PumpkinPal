import React, { useReducer, useEffect } from 'react';
import getGrowerSuggestions from '../../utilities/getGrowerSuggestions';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import { toast } from 'react-hot-toast';

// Function to convert a string to title case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const initialState = {
  growerName: '',
  suggestions: [],
  selectedGrower: null,
  pumpkinPreview: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_GROWER_NAME':
      return { ...state, growerName: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'SET_SELECTED_GROWER':
      return { ...state, selectedGrower: action.payload };
    case 'SET_PUMPKIN_PREVIEW':
      return { ...state, pumpkinPreview: action.payload };
    case 'RESET':
      return initialState;
    default:
      throw new Error();
  }
}

const GrowerSearch = ({ user, handleSave }) => {
  console.log('In GrowerSearch, handleSave is:', handleSave);
  const [state, dispatch] = useReducer(reducer, initialState);

      useEffect(() => {
      if (state.growerName) {
        getGrowerSuggestions(toTitleCase(state.growerName), (error, suggestions) => {
          if (error) {
            toast.error('Error fetching grower suggestions: ' + error.message);
          } else {
            dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
          }
        });
      }
    }, [state.growerName]);

    useEffect(() => {
      if (state.selectedGrower && state.selectedGrower.id) {
        fetchPumpkins(state.selectedGrower.id)
          .then((pumpkins) => {
            dispatch({ type: 'SET_PUMPKIN_PREVIEW', payload: pumpkins });
          })
          .catch((error) => {
            toast.error('Error fetching pumpkins: ' + error.message);
          });
      }
    }, [state.selectedGrower]);

  const handleSelectGrower = (grower) => {
    dispatch({ type: 'SET_SELECTED_GROWER', payload: grower });
  };

 const handleConfirm = () => {
    console.log('handleConfirm called. user.uid:', user.uid, 'state.selectedGrower.id:', state.selectedGrower.id);
    console.log('handleConfirm', user.uid, state.selectedGrower.id);
    handleSave(state.selectedGrower.id); // Call handleSave from MyStats
  };

  return (
    <div>
      <h1>Search for a Grower</h1>
      <input
        type="text"
        value={state.growerName}
        onChange={(e) => dispatch({ type: 'SET_GROWER_NAME', payload: e.target.value })}
        placeholder="Enter grower name"
      />
      {state.suggestions.map(suggestion => (
        <div key={suggestion.id} onClick={() => handleSelectGrower(suggestion)}>
          {suggestion.id}
        </div>
      ))}
      {state.selectedGrower && (
        <div>
          <h2>Selected Grower: {state.selectedGrower.id}</h2>
          <h3>Pumpkin Preview:</h3>
          {state.pumpkinPreview.map(pumpkin => (
            <div key={pumpkin.id}>
              ID: {pumpkin.id}, Year: {pumpkin.year}
            </div>
          ))}
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default GrowerSearch;
