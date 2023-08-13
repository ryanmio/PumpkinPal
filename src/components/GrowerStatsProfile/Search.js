import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch'; // Updated import
import { useNavigate } from 'react-router-dom';

const searchClient = algoliasearch('SPV52PLJT9', '46d4c9707d1655c9a75d6949e02615a0');

const Hit = ({ hit }) => {
  const navigate = useNavigate();

  const handleHitClick = () => {
    navigate(`/site-profile/${encodeURIComponent(hit.objectID)}`);
  };

  return (
    <div onClick={handleHitClick} className="border border-gray-300 p-4 mb-4 cursor-pointer">
      <h3 className="text-lg font-semibold">{hit.objectID}</h3>
      <div className="text-sm text-gray-600">Site Record: {hit['Site Record']}</div>
      <div className="text-sm text-gray-600">Total Entries: {hit['Total Entries']}</div>
    </div>
  );
};

const Search = () => {
  return (
    <div>
      <h1>Search</h1>
      <InstantSearch searchClient={searchClient} indexName="Sites">
        <SearchBox />
        <Hits hitComponent={Hit} /> {/* Directly use the 'Hit' component */}
      </InstantSearch>
    </div>
  );
};

export default Search;
