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

  // Function to render details based on collection type
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
      </InstantSearchNext>
    </div>
  );
};

export default SearchPage;
