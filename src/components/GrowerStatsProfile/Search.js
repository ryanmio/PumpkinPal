import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
  connectStateResults,
} from 'react-instantsearch';
import { useNavigate } from 'react-router-dom';

const searchClient = algoliasearch(
  'SPV52PLJT9',
  '46d4c9707d1655c9a75d6949e02615a0'
);

const Hit = ({ hit }) => {
  const navigate = useNavigate();

  const handleHitClick = () => {
    navigate(`/site-profile/${encodeURIComponent(hit.objectID)}`);
  };

  return (
    <div onClick={handleHitClick} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h3><Highlight attribute="objectID" hit={hit} /></h3>
      <div>Site Record: {hit['Site Record']}</div>
      <div>Total Entries: {hit['Total Entries']}</div>
    </div>
  );
};

const Results = connectStateResults(({ searchState, searchResults, children }) =>
  searchState && searchState.query && searchResults && searchResults.nbHits > 0 ? (
    children
  ) : null
);

const Search = () => {
  return (
    <div>
      <h1>Search</h1>
      <InstantSearch searchClient={searchClient} indexName="Sites">
        <SearchBox />
        <Results>
          <Hits hitComponent={Hit} />
        </Results>
      </InstantSearch>
    </div>
  );
};

export default Search;
