import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // assuming you have a firebase.js file where you initialize firebase
import { collection, getDocs } from 'firebase/firestore'; // import collection, getDocs
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSuggestions();
  }, []);

  const getSuggestions = async () => {
    const contests = await getDocs(collection(db, 'Stats_Contests'));
    const contestNames = contests.docs.map(doc => ({ type: 'contest', name: doc.data().name }));

    const pumpkins = await getDocs(collection(db, 'Stats_Pumpkins'));
    const pumpkinIds = pumpkins.docs.map(doc => ({ type: 'pumpkin', id: doc.data().id }));

    setSuggestions([...contestNames, ...pumpkinIds]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const matchedSuggestion = suggestions.find(suggestion => suggestion.name === searchTerm || suggestion.id === searchTerm);
    if (matchedSuggestion) {
      if (matchedSuggestion.type === 'contest') {
        navigate(`/contest/${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate(`/pumpkin/${encodeURIComponent(searchTerm.trim())}`);
      }
    } else {
      // handle case where no matching suggestion is found
    }
  };

  return (
    <div>
      <h1>Search</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter contest name or pumpkin ID"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default Search;
