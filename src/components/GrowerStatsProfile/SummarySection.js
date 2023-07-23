const SummarySection = ({ data }) => (
  <div>
    <h2>Summary</h2>
    <p>Total Entries: {data.NumberOfEntries}</p>
    <p>Global Ranking: {data.globalRanking}</p>
    <p>Country Ranking: {data.countryRanking}</p>
    <p>State Ranking: {data.stateRanking}</p>
    <p>Max Pumpkin Weight: {data.LifetimeMaxWeight}</p>
    <p>Best Rank: {data.bestRank}</p>
  </div>
);

export default SummarySection;
