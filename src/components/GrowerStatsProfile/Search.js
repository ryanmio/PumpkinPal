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
  'SPV52PLJT9', // Replace with your Algolia Application Id
  '46d4c9707d1655c9a75d6949e02615a0' // Replace with your Algolia Search-Only API Key
);

const Hit = ({ hit }) => {
  const navigate = useNavigate();

  const handleHitClick = () => {
    if (hit.type === 'contest') {
      navigate(`/contest/${encodeURIComponent(hit.name)}`);
    } else {
      navigate(`/pumpkin/${encodeURIComponent(hit.id)}`);
    }
  };

  return (
    <div onClick={handleHitClick}>
      <Highlight attribute="objectID" hit={hit} />
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
