import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
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
    <div onClick={handleHitClick}>
      <Highlight attribute="objectID" hit={hit} />
      <div>Site Record: {hit['Site Record']}</div>
      <div>Total Entries: {hit['Total Entries']}</div>
    </div>
  );
};

const Search = () => {
  return (
    <div>
      <h1>Search</h1>
      <InstantSearch searchClient={searchClient} indexName="Sites">
        <SearchBox />
        <Hits hitComponent={Hit} />
      </InstantSearch>
    </div>
  );
};

export default Search;
