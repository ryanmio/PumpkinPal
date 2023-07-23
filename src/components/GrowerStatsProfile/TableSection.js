import { useMemo } from 'react';
import { useTable } from 'react-table';

const TableSection = ({ data, columns }) => {
  const columns = useMemo(() => [
    { Header: 'Year', accessor: 'year' },
    { Header: 'Contest', accessor: 'contestName' },
    { Header: 'Weight', accessor: 'weight' },
    { Header: 'Rank', accessor: 'place' },
    // Add more columns as needed
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div>
      <h2>Pumpkins</h2>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
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
