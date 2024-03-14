'use client'
import React, { useContext } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Hits, connectSearchBox } from 'react-instantsearch-dom';
import { useRouter } from 'next/navigation';
import { GrowerContext } from '../../../contexts/GrowerContext';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../../../app/utilities/error-analytics';

// Initialize Algolia search client
const searchClient = algoliasearch('SPV52PLJT9', process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);

// Custom Search Box component
const SearchInput = ({ currentRefinement, refine }) => (
  <div className="p-4 flex items-center">
    <input
      type="search"
      value={currentRefinement}
      onChange={(event) => refine(event.currentTarget.value)}
      placeholder="Search for growers, pumpkins, or sites..."
      className="w-full rounded-md border border-gray-300 text-xl"
    />
    {/* Add any icons or additional elements here */}
  </div>
);

// Connect the custom SearchInput component to Algolia's search state
const CustomSearchBox = connectSearchBox(SearchInput);

// Component to render each hit
const Hit = ({ hit }) => {
  const router = useRouter();
  const { setGrowerName } = useContext(GrowerContext);

  const handleHitClick = () => {
    trackUserEvent(GA_ACTIONS.SEARCH_CLICK, GA_CATEGORIES.SEARCH);
    const collectionType = hit.path.split('/')[0];
    
    switch (collectionType) {
      case 'Stats_Growers':
        setGrowerName(hit.objectID);
        router.push(`/grower/${encodeURIComponent(hit.objectID)}`, undefined, {
          state: { from: router.pathname }
        });
        break;
      case 'Stats_Pumpkins':
        router.push(`/pumpkin-details/${encodeURIComponent(hit.objectID)}`);
        break;
      case 'Stats_Sites':
        router.push(`/site-profile/${encodeURIComponent(hit.objectID)}`);
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
  <div
    onClick={handleHitClick}
    className="p-4 bg-white rounded shadow hover:shadow-md transition-shadow cursor-pointer mb-4"
  >
    <h3 className="text-lg font-semibold">{hit.objectID}</h3>
    {renderDetails()}
  </div>
);
};

// Main Search component
const Search = () => {
  return (
    <div className="bg-f2eee3 text-36382e">
      <InstantSearch searchClient={searchClient} indexName="AllTypes">
        <CustomSearchBox />
        <Hits hitComponent={Hit} classNames={{
          root: 'p-5',
          list: 'flex flex-col',
          item: 'mb-4'
        }} />
      </InstantSearch>
    </div>
  );
};

export default Search;
