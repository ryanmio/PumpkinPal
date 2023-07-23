const SummarySection = ({ data }) => (
  <div>
    <h2>Summary</h2>
    <p>Country: {data.country}</p>
    <p>State: {data.state}</p>
    <p>Total Entries: {data.totalEntries}</p>
    <p>Global Ranking: {data.globalRanking}</p>
    <p>Country Ranking: {data.countryRanking}</p>
    <p>State Ranking: {data.stateRanking}</p>
    <p>Max Pumpkin Weight: {data.maxWeight}</p>
    <p>Best Rank: {data.bestRank}</p>
  </div>
);
