import { useTable, useSortBy } from 'react-table';

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

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col overflow-x-auto">
      <h2 className="text-xl font-bold mb-2">Pumpkins</h2>
      <table {...getTableProps()} className="w-full">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className={`whitespace-nowrap min-w-max table-cell ${column.id === 'contestName' ? 'w-[300px]' : column.id === 'year' ? 'w-[75px]' : 'w-[100px]'}`}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
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
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className={`table-cell ${cell.column.id === 'contestName' ? 'w-[200px]' : cell.column.id === 'year' ? 'w-[75px]' : 'w-[100px]'}`}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableSection;
