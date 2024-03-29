// app/grower/[growerName]/Header.js
const Header = ({ data }) => {
  // Ensure globalRanking is defined before calling replace
  const strippedRanking = data.globalRanking ? data.globalRanking.replace('Global: ', '') : '';

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h1 className="text-2xl font-bold mb-2">{data.firstName} {data.lastName}</h1>
      <h2 className="text-xl font-medium">Global Rank: {strippedRanking}</h2>
    </div>
  );
};

export default Header;
