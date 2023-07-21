import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GrowerSearch = () => {
  const [growerName, setGrowerName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/grower/${encodeURIComponent(growerName.trim())}`);
  };

  return (
    <div>
      <h1>Search for a Grower</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={growerName}
          onChange={(e) => setGrowerName(e.target.value)}
          placeholder="Enter grower name"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default GrowerSearch;
