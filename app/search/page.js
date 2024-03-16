'use client'
// app/search/page.js
import React, { useContext, useEffect, useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { SearchBox, Hits, Configure } from 'react-instantsearch'; 
import { useRouter } from 'next/navigation';
import { GrowerContext } from '../../contexts/GrowerContext';
import { trackUserEvent, trackError, GA_ACTIONS, GA_CATEGORIES } from '../../app/utilities/error-analytics';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

const searchClient = algoliasearch('SPV52PLJT9', process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);

// Define the icon components
const SiteIcon = () => (
  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const PumpkinIcon = () => (
  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 17a7.5 7.5 0 110-10M5 17a7.5 7.5 0 100-10" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GrowerIcon = () => (
  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2 7h-4l2-7zM5.5 10h13l-1.5 5h-10l-1.5-5zM2 20h20" />
  </svg>
);

// Define the Right Arrow Icon Component
const RightArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Hit = ({ hit }) => {
  const router = useRouter();
  const { setGrowerName } = useContext(GrowerContext);

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

  // Function to render details based on collection type
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

  const collectionType = hit.path.split('/')[0];
  const Icon = getIcon(collectionType);

  return (
    <div
      onClick={handleHitClick}
      className="p-4 bg-white rounded shadow hover:shadow-md transition-shadow cursor-pointer mb-4 flex items-center mx-auto max-w-lg"
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

const NoIcon = () => null;

const SearchPage = () => {
  const router = useRouter();
  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Ensure router is ready before attempting to read query parameters
    if (router.isReady) {
      const query = router.query.query;
      if (query) {
        setSearchQuery(query);
      }
    }
  }, [router.isReady, router.query]);

  return (
    <div className="bg-f2eee3 text-36382e">
      <InstantSearchNext
        searchClient={searchClient}
        indexName="AllTypes"
        // Use the searchQuery state as the initial search state
        searchState={{ query: searchQuery }}
        routing
      >
        <Configure hitsPerPage={10} /> {/* Added Configure component to set hitsPerPage to 20 */}
        <div className="p-4 flex justify-center"> {/* Adjusted padding and centering */}
          <div className="flex items-center bg-white rounded-lg shadow-md p-2 mx-auto max-w-lg w-full"> {/* Set max width and centering to match hits, ensure full width */}
            <svg
              className="h-6 w-6 text-[#ff6d00]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <input
              className="flex-1 ml-4 outline-none border-none" // Removed border and adjusted margin
              placeholder="Search for a pumpkin grower..."
              type="text"
              style={{ boxShadow: 'none', background: 'white' }} // Inline style to remove any default browser styles and set background to white
            />
          </div>
        </div>
        <Hits hitComponent={Hit} classNames={{
          root: 'p-5',
          list: 'flex flex-col',
          item: 'mb-4'
        }} />
      </InstantSearchNext>
    </div>
  );
};

export default SearchPage;
