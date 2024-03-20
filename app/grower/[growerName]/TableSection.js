'use client'
// app/grower/[growerName]/TableSection.js
import { useTable, useSortBy } from 'react-table';
import Link from 'next/link';

// Define columns inside TableSection.js
const columns = [
  {
    Header: 'Weight',
    accessor: 'weight',
    Cell: ({ value, row: { original } }) => (
      <Link href={`/pumpkin-details/${original.id}`} className="text-current no-underline hover:underline">
        {value} lbs
      </Link>
    ),
  },
  { Header: 'Year', accessor: 'year' },
  { Header: 'Contest', accessor: 'contestName' },
  {
    Header: 'Details',
    id: 'details',
    Cell: ({ row: { original } }) => (
      <Link href={`/pumpkin-details/${original.id}`} className="no-underline">
        <button className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Details
        </button>
      </Link>
    ),
  },
];

const TableSection = ({ data }) => {
  // Use the columns defined above
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

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col overflow-x-auto mb-4">
      <h2 className="text-xl font-bold mb-2">Weigh-Off History</h2>
      <table {...getTableProps()} className="w-full table-fixed">
        <thead>
          {headerGroups.map(headerGroup => {
            const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...restHeaderGroupProps}>
                {headerGroup.headers.map(column => {
                  const { key: headerKey, ...restHeaderProps } = column.getHeaderProps(column.getSortByToggleProps());
                  return (
                    <th key={headerKey} {...restHeaderProps} className={`whitespace-nowrap table-cell ${column.id === 'contestName' ? 'w-[200px]' : column.id === 'year' ? 'w-[75px]' : 'w-[100px]'}`}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted ? (column.isSortedDesc ? ' ▾' : ' ▴') : ''}
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            const { key, ...restRowProps } = row.getRowProps();
            return (
              <tr key={key} {...restRowProps}>
                {row.cells.map(cell => {
                  if (cell.column.id === 'contestName') {
                    const { key: cellKey, ...restCellProps } = cell.getCellProps();
                    return (
                      <td key={cellKey} {...restCellProps} className={`table-cell-spacing w-[200px]`}>
                        <div className={`w-full`} title={cell.value}>
                          <Link href={`/site-profile/${encodeURIComponent(row.original.contestName)}`} className="text-current hover:text-current no-underline hover:underline">
                            {cell.render('Cell')}
                          </Link>
                        </div>
                      </td>
                    );
                  }

                  const { key: cellKey, ...restCellProps } = cell.getCellProps();
                  return (
                    <td key={cellKey} {...restCellProps} className={`table-cell-spacing ${cell.column.id === 'year' ? 'w-[75px]' : 'w-[100px]'}`}>
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

