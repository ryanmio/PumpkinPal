import { useTable, useSortBy } from 'react-table';
import { Link } from 'react-router-dom';

const TableSection = ({ data, columns }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ 
    columns, 
    data, 
    initialState: { sortBy: [{ id: 'weight', desc: true }] }
  }, useSortBy);

  const navigate = useNavigate();

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col overflow-x-auto">
      <h2 className="text-xl font-bold mb-2">Weigh-Off History</h2>
      <table {...getTableProps()} className="w-full table-fixed">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className={`whitespace-nowrap table-cell ${column.id === 'contestName' ? 'w-[200px]' : column.id === 'year' ? 'w-[75px]' : 'w-[100px]'}`}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' ▾' : ' ▴') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
  if (cell.column.id === 'contestName') {
    return (
      <td {...cell.getCellProps()} className={`table-cell truncate overflow-hidden w-[200px]`}>
        <div className={`w-full`} title={cell.value}>
          <Link to={`/site-profile/${row.original.siteId}`} className="text-current hover:text-current no-underline hover:underline">
            {cell.render('Cell')}
          </Link>
        </div>
      </td>
    );
  }

                  return (
                    <td {...cell.getCellProps()} className={`table-cell truncate overflow-hidden ${cell.column.id === 'year' ? 'w-[75px]' : 'w-[100px]'}`}>
                      <div className={`w-full`} title={cell.value}>
                        {cell.render('Cell')}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
                </tbody>
      </table>
    </div>
  );
};

export default TableSection;

