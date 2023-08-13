import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, connectSearchBox, Hits } from 'react-instantsearch';
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

const CustomSearchBox = ({ currentRefinement, refine }) => {
  return (
    <input
      type="text"
      value={currentRefinement}
      onChange={e => refine(e.target.value)}
      placeholder="Search..."
    />
  );
};

const ConnectedSearchBox = connectSearchBox(CustomSearchBox);

const Search = () => {
  const [query, setQuery] = useState('');

  return (
    <div>
      <h1>Search</h1>
      <InstantSearch searchClient={searchClient} indexName="Sites">
        <ConnectedSearchBox onSearchStateChange={({ query }) => setQuery(query)} />
        {query && <Hits hitComponent={Hit} />}
      </InstantSearch>
    </div>
  );
};

export default Search;
