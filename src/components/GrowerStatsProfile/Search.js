'use client'
import React, { useContext, useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Hits, connectSearchBox } from 'react-instantsearch-dom';
import { useRouter } from 'next/navigation';
import { GrowerContext } from '../../../contexts/GrowerContext';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../../../app/utilities/error-analytics';

// Initialize Algolia search client
const searchClient = algoliasearch('SPV52PLJT9', process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);

// Placeholder SVG icons for each type
const SiteIcon = () => (
  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* SVG path for 'Site' icon */}
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const PumpkinIcon = () => (
  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* SVG path for 'Pumpkin' icon */}
    <path d="M19 17a7.5 7.5 0 110-10M5 17a7.5 7.5 0 100-10" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GrowerIcon = () => (
  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* SVG path for 'Grower' icon */}
    <path d="M12 2l2 7h-4l2-7zM5.5 10h13l-1.5 5h-10l-1.5-5zM2 20h20" />
  </svg>
);

// Custom Search Box component optimized for mobile and desktop
const SearchInput = ({ currentRefinement, refine }) => (
  <div className="flex justify-center p-2 sm:p-4">
    <input
      type="search"
      value={currentRefinement}
      onChange={(event) => refine(event.currentTarget.value)}
      placeholder="Search for growers, pumpkins, or sites..."
      className="w-full max-w-lg rounded-md border border-gray-300 text-base sm:text-xl p-2"
    />
  </div>
);

// Connect the custom SearchInput component to Algolia's search state
const CustomSearchBox = connectSearchBox(SearchInput);

// Right arrow SVG component (or you can use an icon from a library like Heroicons)
const RightArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400 ml-auto" // Tailwind classes for size and color
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

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
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Site Record:</span> {hit['Site Record']} lbs
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Total Entries:</span> {hit['Total Entries']}
            </div>
          </>
        );
      case 'Stats_Pumpkins':
        return (
          <>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Year:</span> {hit['year']}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Grower:</span> {hit['grower']}
            </div>
          </>
        );
      case 'Stats_Growers':
        return (
          <>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Lifetime Max Weight:</span> {hit['LifetimeMaxWeight']} lbs
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Number Of Entries:</span> {hit['NumberOfEntries']}
            </div>
          </>
        );
      default:
        const errorMsg = 'Unknown collection type: ' + collectionType;
        console.error(errorMsg);
        trackError(errorMsg, GA_CATEGORIES.SEARCH, 'Search', GA_ACTIONS.SEARCH_CLICK);
        break;
    }
  };

  // Function to select the correct icon based on the collection type
  const getIcon = (collectionType) => {
    switch (collectionType) {
      case 'Stats_Sites':
        return <SiteIcon />;
      case 'Stats_Pumpkins':
        return <PumpkinIcon />;
      case 'Stats_Growers':
        return <GrowerIcon />;
      default:
        return null; // Or a default icon if you have one
    }
  };

  const collectionType = hit.path.split('/')[0];
  const Icon = getIcon(collectionType);

  return (
    <div
      onClick={handleHitClick}
      className="p-4 bg-white rounded shadow hover:shadow-md transition-shadow cursor-pointer mb-4 mx-auto max-w-lg flex items-center"
    >
      <div className="flex-shrink-0 mr-4">
        {Icon}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{hit.objectID}</h3>
        {renderDetails()}
      </div>
      <RightArrowIcon />
    </div>
  );
};

// Main Search component
const Search = () => {
  const router = useRouter();
  const [searchState, setSearchState] = useState('');

  // Function to handle search state changes
  const onSearchStateChange = ({ query }) => {
    setSearchState(query);
  };

 // Function to navigate to the full results page with search terms
const viewFullResults = () => {
  if (typeof searchState === 'string' && searchState.trim() !== '') {
    // Construct the URL using the default Algolia InstantSearch URL scheme
    const searchURL = `/search?AllTypes%5Bquery%5D=${encodeURIComponent(searchState)}`;
    router.push(searchURL);
  } else {
    console.error('Search state is not a string or is empty:', searchState);
  }
};

  return (
    <div className="bg-f2eee3 text-36382e">
      <InstantSearch
        searchClient={searchClient}
        indexName="AllTypes"
        onSearchStateChange={onSearchStateChange} // Listen for changes in the search state
      >
        <CustomSearchBox />
        <Hits hitComponent={Hit} classNames={{
          root: 'p-5',
          list: 'flex flex-col',
          item: 'mb-4'
        }} />
        {/* Add a button or link for full results */}
        {searchState && (
          <div className="flex justify-center mt-4">
            <button
              onClick={viewFullResults}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Full Results
            </button>
          </div>
        )}
      </InstantSearch>
    </div>
  );
};

export default Search;
