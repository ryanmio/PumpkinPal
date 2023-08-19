import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { useNavigate } from 'react-router-dom';

const searchClient = algoliasearch('SPV52PLJT9', process.env.REACT_APP_ALGOLIA_API_KEY);

const Hit = ({ hit }) => {
  const navigate = useNavigate();

  const handleHitClick = () => {
    navigate(`/site-profile/${encodeURIComponent(hit.objectID)}`);
  };

  return (
    <div onClick={handleHitClick}>
      <h3 className="text-lg font-semibold cursor-pointer">{hit.objectID}</h3>
      <div className="text-sm">Site Record: {hit['Site Record']} lbs</div>
      <div className="text-sm">Total Entries: {hit['Total Entries']}</div>
    </div>
  );
};

const NoIcon = () => null;

const Search = () => {
  return (
    <div className="bg-f2eee3 text-36382e">
      <InstantSearch searchClient={searchClient} indexName="AllTypes">
        <div className="p-4 flex items-center">
          <SearchBox
            placeholder="Search for growers, pumpkins, or sites..."
            className="w-full rounded-md border border-gray-300 text-xl"
            submitIconComponent={NoIcon}
            resetIconComponent={() => <></>}
          />
        </div>
        <Hits
          hitComponent={Hit}
          classNames={{
            root: 'MyCustomHits',
            list: 'MyCustomHitsList MyCustomHitsList--subclass',
            item: 'MyCustomHitItem'
          }}
        />
      </InstantSearch>
    </div>
  );
};

export default Search;

