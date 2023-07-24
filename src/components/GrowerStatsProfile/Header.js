const Header = ({ data }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <h1 className="text-2xl font-bold mb-2">{data.firstName} {data.lastName}</h1>
    <h2 className="text-xl font-medium">Global Rank: {data.globalRanking}</h2>
  </div>
);

export default Header;
