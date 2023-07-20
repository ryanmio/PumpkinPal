const Header = ({ data }) => (
  <div>
    <h1>{data.firstName} {data.lastName}</h1>
    <h2>Global Rank: {data.bestRank}</h2>
  </div>
);

export default Header;
