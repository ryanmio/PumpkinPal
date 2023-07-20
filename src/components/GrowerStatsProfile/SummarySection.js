const SummarySection = ({ data }) => (
  <div>
    <h2>Summary</h2>
    <p>Country: {data.country}</p>
    <p>State: {data.state}</p>
    <p>Total Entries: {data.pumpkins.length}</p>
    {/* More stats here */}
  </div>
);

export default SummarySection;
