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
    <div onClick={handleHitClick} className="border border-gray-300 p-4 mb-4 cursor-pointer bg-ffd699 text-36382e rounded-md">
      <h3 className="text-lg font-semibold cursor-pointer">{hit.objectID}</h3>
      <div className="text-sm">Site Record: {hit['Site Record']}</div>
      <div className="text-sm">Total Entries: {hit['Total Entries']}</div>
    </div>
  );
};

const Search = () => {
  return (
    <div className="bg-f2eee3 text-36382e">
      <h1 className="text-center text-2xl font-bold py-4">Search</h1>
      <InstantSearch searchClient={searchClient} indexName="Sites">
        <div className="p-4 flex items-center">
          <SearchBox
            translations={{
              placeholder: 'Search sites...',
            }}
            className="w-full rounded-md border border-gray-300 pl-3 py-2"
          />
        </div>
        <Hits hitComponent={Hit} className="p-4"/> {/* Directly use the 'Hit' component */}
      </InstantSearch>
    </div>
  );
};

export default Search;
