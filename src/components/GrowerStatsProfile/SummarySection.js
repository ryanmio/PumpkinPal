const SummarySection = ({ data }) => {
  const globalRanking = data.globalRanking.replace("Global: ", "");

  return (
    <div className="bg-white shadow rounded-lg p-4 md:col-span-2 flex flex-col">
      <h2 className="text-xl font-bold mb-2">Lifetime Stats</h2>
      <p>Total Entries: {data.NumberOfEntries}</p>
      <p>Grower Rank: {globalRanking}</p>
      <p>Country Ranking: {data.countryRanking}</p>
      <p>State Ranking: {data.stateRanking}</p>
      <p>Max Pumpkin Weight: {data.LifetimeMaxWeight}</p>
      <p>Best Rank: {data.bestRank}</p>
    </div>
  );
};

export default SummarySection;
