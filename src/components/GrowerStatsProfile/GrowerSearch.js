import React, { useState, useEffect } from 'react';
import getGrowerSuggestions from '../../utilities/getGrowerSuggestions';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const GrowerSearch = ({ user, setGrowerId }) => { // accept user as a prop
  const [growerName, setGrowerName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedGrower, setSelectedGrower] = useState(null);
  const [pumpkinPreview, setPumpkinPreview] = useState([]);

  useEffect(() => {
    if (growerName) {
      getGrowerSuggestions(growerName, setSuggestions);
    }
  }, [growerName]);

  useEffect(() => {
    if (selectedGrower) {
      fetchPumpkins(selectedGrower.id).then(setPumpkinPreview);
    }
  }, [selectedGrower]);

  const handleSelectGrower = (grower) => {
    setSelectedGrower(grower);
  };

  const handleConfirm = () => {
    updateDoc(doc(db, 'Users', user.uid), {
      growerId: selectedGrower.id
    }).then(() => {
      setGrowerId(selectedGrower.id);
    }).catch(error => {
      console.error('Error updating document:', error);
    });
  };

  return (
    <div>
      <h1>Search for a Grower</h1>
      <input
        type="text"
        value={growerName}
        onChange={(e) => setGrowerName(e.target.value)}
        placeholder="Enter grower name"
      />
      {suggestions.map(suggestion => (
        <div key={suggestion.id} onClick={() => handleSelectGrower(suggestion)}>
          {suggestion.name}
        </div>
      ))}
      {selectedGrower && (
        <div>
          <h2>Selected Grower: {selectedGrower.name}</h2>
          <h3>Pumpkin Preview:</h3>
          {pumpkinPreview.map(pumpkin => (
            <div key={pumpkin.id}>
              {pumpkin.name}
            </div>
          ))}
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default GrowerSearch;
