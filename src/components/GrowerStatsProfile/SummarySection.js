const SummarySection = ({ data }) => (
  <div>
    <h2>Summary</h2>
    <p>Country: {data.country}</p>
    <p>State: {data.state}</p>
    <p>Total Entries: {data.pumpkins ? data.pumpkins.length : 0}</p>
    {/* More stats here */}
  </div>
);

export default SummarySection;
