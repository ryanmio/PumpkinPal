import React, { useReducer, useEffect } from 'react';
import getGrowerSuggestions from '../utilities/getGrowerSuggestions';
import fetchPumpkins from '../utilities/fetchPumpkins';
import { toast } from 'react-hot-toast';
import TableSection from '../grower/[growerName]/TableSection';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../utilities/error-analytics';

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
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
  if (state.growerName) {
    trackUserEvent(GA_ACTIONS.Search_Initiated, GA_CATEGORIES.GrowerSearch);
   getGrowerSuggestions(toTitleCase(state.growerName), (error, suggestions) => {
  if (error) {
    trackError(error.message, 'getGrowerSuggestions', GA_CATEGORIES.GrowerSearch, GA_ACTIONS.Fetch_Suggestions_Failure);
    toast.error('Error fetching grower suggestions: ' + error.message);
  } else {
    trackUserEvent(GA_ACTIONS.Fetch_Suggestions_Success, GA_CATEGORIES.GrowerSearch);
    dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
  }
});
  }
}, [state.growerName]);

  useEffect(() => {
  if (state.selectedGrower && state.selectedGrower.id) {
    fetchPumpkins(state.selectedGrower.id)
      .then((pumpkins) => {
        trackUserEvent(GA_ACTIONS.Pumpkin_Data_Fetched, GA_CATEGORIES.GrowerSearch);
        dispatch({ type: 'SET_PUMPKIN_PREVIEW', payload: pumpkins });
      })
      .catch((error) => {
        trackError(error, 'fetchPumpkins', GA_CATEGORIES.GrowerSearch, GA_ACTIONS.Pumpkin_Data_Error);
      });
  }
}, [state.selectedGrower]);


  const handleSelectGrower = (grower) => {
    trackUserEvent(GA_ACTIONS.Grower_Selected, GA_CATEGORIES.GrowerSearch);
    dispatch({ type: 'SET_SELECTED_GROWER', payload: grower });
  };

  const handleConfirm = () => {
    trackUserEvent(GA_ACTIONS.Grower_Confirmed, GA_CATEGORIES.GrowerSearch);
    console.log('handleConfirm called. user.uid:', user.uid, 'state.selectedGrower.id:', state.selectedGrower.id);
    console.log('handleConfirm', user.uid, state.selectedGrower.id);
    handleSave(state.selectedGrower.id); // Call handleSave from MyStats
  };

  const pumpkinColumns = [
    { Header: 'Year', accessor: 'year' },
    { Header: 'Contest', accessor: 'contestName' },
    { Header: 'Weight', accessor: 'weight' },
  ];

  return (
    <div className="min-h-screen flex justify-start flex-col items-center">  
    <div className="container mx-auto px-4 pt-10 mt-4 flex flex-col space-y-4 bg-white shadow rounded-lg p-4 max-w-2xl w-full">  
      <h1 className="text-2xl font-bold mb-4 text-center">Search for your name</h1>
      <input
        type="text"
        value={state.growerName}
        onChange={(e) => dispatch({ type: 'SET_GROWER_NAME', payload: e.target.value })}
        placeholder="Enter grower name"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      {state.suggestions.map(suggestion => (
        <div key={suggestion.id} onClick={() => handleSelectGrower(suggestion)} className="bg-white shadow p-2 mt-2 cursor-pointer hover:bg-gray-100">
          {suggestion.id}
        </div>
      ))}
      {state.selectedGrower && (
        <div className="flex flex-col mt-4">
          <h2>Selected Grower: {state.selectedGrower.id}</h2>
          <h3 className="text-xl font-bold mb-2">Pumpkin Preview:</h3>
          <TableSection data={state.pumpkinPreview} columns={pumpkinColumns} />
          <button onClick={handleConfirm} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 self-center">Confirm</button>
        </div>
      )}
    </div>
  </div>
);
};

export default GrowerSearch;
