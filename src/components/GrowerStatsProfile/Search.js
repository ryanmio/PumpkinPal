import React, { useContext } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { useNavigate, useLocation } from 'react-router-dom';
import { GrowerContext } from '../../contexts/GrowerContext';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../../utilities/error-analytics';

const searchClient = algoliasearch('SPV52PLJT9', process.env.REACT_APP_ALGOLIA_API_KEY);

const Hit = ({ hit }) => {
  const navigate = useNavigate();
  const { setGrowerName } = useContext(GrowerContext);
  const location = useLocation(); // Import useLocation

  const handleHitClick = () => {
    trackUserEvent(GA_ACTIONS.SEARCH_CLICK, GA_CATEGORIES.SEARCH);
    const collectionType = hit.path.split('/')[0];
    
    switch (collectionType) {
      case 'Stats_Growers':
        setGrowerName(hit.objectID);
        navigate(`/grower/${encodeURIComponent(hit.objectID)}`, {
          state: { from: location.pathname } // Pass the current pathname
        });
        break;
      case 'Stats_Pumpkins':
        navigate(`/pumpkin-details/${encodeURIComponent(hit.objectID)}`);
        break;
      case 'Stats_Sites':
        navigate(`/site-profile/${encodeURIComponent(hit.objectID)}`);
        break;
      default:
      const errorMsg = 'Unknown collection type: ' + collectionType;
      console.error(errorMsg);
      trackError(errorMsg, GA_CATEGORIES.SEARCH, 'Search', GA_ACTIONS.SEARCH_CLICK);
      break;
    }
  };

  const renderDetails = () => {
  const collectionType = hit.path.split('/')[0];
  switch (collectionType) {
    case 'Stats_Sites':
      return (
        <>
          <div className="text-sm">Site Record: {hit['Site Record']} lbs</div>
          <div className="text-sm">Total Entries: {hit['Total Entries']}</div>
        </>
      );
    case 'Stats_Pumpkins':
      return (
        <>
          <div className="text-sm">Year: {hit['year']}</div>
          <div className="text-sm">Grower: {hit['grower']}</div>
        </>
      );
    case 'Stats_Growers':
      return (
        <>
          <div className="text-sm">Lifetime Max Weight: {hit['LifetimeMaxWeight']} lbs</div>
          <div className="text-sm">Number Of Entries: {hit['NumberOfEntries']}</div>
        </>
      );
    default:
      const errorMsg = 'Unknown collection type: ' + collectionType;
      console.error(errorMsg);
      trackError(errorMsg, GA_CATEGORIES.SEARCH, 'Search', GA_ACTIONS.SEARCH_CLICK);
      break;
  }
};

  return (
    <div onClick={handleHitClick}>
      <h3 className="text-lg font-semibold cursor-pointer">{hit.objectID}</h3>
      {renderDetails()}
    </div>
  );
};

const NoIcon = () => null;

const Search = () => {
  const handleSearch = (event) => {
    trackUserEvent(GA_ACTIONS.PERFORM_SEARCH, GA_CATEGORIES.SEARCH);
  };

  return (
    <div className="bg-f2eee3 text-36382e">
      <InstantSearch searchClient={searchClient} indexName="AllTypes">
        <div className="p-4 flex items-center">
          <SearchBox
            onSearchChange={handleSearch}
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
