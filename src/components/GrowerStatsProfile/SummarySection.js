const SummarySection = ({ data, pumpkins }) => (
  <div>
    <h2>Summary</h2>
    <p>Country: {data.country}</p>
    <p>State: {data.state}</p>
    <p>Total Entries: {pumpkins.length}</p>
    {/* More stats here */}
  </div>
);

export default SummarySection;
