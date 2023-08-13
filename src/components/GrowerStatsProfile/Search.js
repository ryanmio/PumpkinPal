import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { useNavigate } from 'react-router-dom';

const searchClient = algoliasearch('SPV52PLJT9', '46d4c9707d1655c9a75d6949e02615a0');

const Hit = ({ hit }) => {
  const navigate = useNavigate();

  const handleHitClick = () => {
    navigate(`/site-profile/${encodeURIComponent(hit.objectID)}`);
  };

  return (
    <div onClick={handleHitClick} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h3>{hit.objectID}</h3>
      <div>Site Record: {hit['Site Record']}</div>
      <div>Total Entries: {hit['Total Entries']}</div>
    </div>
  );
};

const Search = () => {
  const [query, setQuery] = useState(''); // Track the query state

  return (
    <div>
      <h1>Search</h1>
      <InstantSearch searchClient={searchClient} indexName="Sites">
        <SearchBox onSearchChange={(e) => setQuery(e.query)} /> {/* Update the query state on change */}
        {query && <Hits hitComponent={Hit} />} {/* Render Hits only when query is present */}
      </InstantSearch>
    </div>
  );
};

export default Search;
