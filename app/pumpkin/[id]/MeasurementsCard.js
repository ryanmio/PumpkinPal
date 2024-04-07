import React from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { toast, Toaster } from 'react-hot-toast';
import { showDeleteConfirmation } from '../../../components/ui/Alert';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../../utilities/error-analytics';

const MeasurementsCard = ({ measurements, pumpkinId, pollinationDate }) => {
  const router = useRouter(); // Call useRouter at the top level

  // Define columns inside the component to access `router`
  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Date',
    },
    {
      accessorFn: (row) => {
        if (!pollinationDate || pollinationDate === "Not Set") {
          return '-';
        }
        const pollinationDateObj = new Date(pollinationDate);
        const measurementDate = new Date(row.timestamp);
        const dap = Math.round((measurementDate - pollinationDateObj) / (1000 * 60 * 60 * 24));
        return dap;
      },
      header: 'DAP',
    },
    {
      accessorKey: 'endToEnd',
      header: 'End to End',
    },
    {
      accessorKey: 'sideToSide',
      header: 'Side to Side',
    },
    {
      accessorKey: 'circumference',
      header: 'Circumference',
    },
    {
      accessorKey: 'measurementUnit',
      header: 'Units',
    },
    {
      accessorKey: 'estimatedWeight',
      header: 'OTT Weight',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => router.push(`/edit-measurement/${pumpkinId}/${row.original.id}`)}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => deleteMeasurement(row.original.id)}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: measurements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const deleteMeasurement = async (measurementId) => {
    showDeleteConfirmation('Are you sure you want to delete this measurement?', "You won't be able to undo this.", async () => {
      try {
        if (auth.currentUser?.uid && pumpkinId && measurementId) {
          const measurementPath = `Users/${auth.currentUser.uid}/Pumpkins/${pumpkinId}/Measurements/${measurementId}`;
          await deleteDoc(doc(db, measurementPath));
          toast.success("Measurement deleted successfully.");
          trackUserEvent(GA_ACTIONS.DELETE_MEASUREMENT, 'MeasurementsCard - Successful Delete');
        } else {
          throw new Error("Missing required parameters.");
        }
      } catch (error) {
        console.error("Error deleting measurement: ", error);
        toast.error("Failed to delete measurement. Please try again.");
        trackError(error, 'MeasurementsCard - Failed Delete', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      }
    });
  };

  const exportData = async () => {
    toast('Exporting...', { id: 'exporting' });
    const idToken = await auth.currentUser?.getIdToken();

    fetch(`https://us-central1-pumpkinpal-b60be.cloudfunctions.net/exportData?pumpkinId=${pumpkinId}&timeZone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`, {
      headers: {
        'Authorization': 'Bearer ' + idToken
      }
    }).then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // Format the current date as YYYY-MM-DD
        const date = new Date().toISOString().slice(0, 10);
        a.download = `PumpkinPal_${pumpkin.name}_${date}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Export successful!");
        trackUserEvent(GA_ACTIONS.EXPORT_DATA, 'MeasurementsCard - Successful Export');
      }).catch(e => {
        console.error(e);
        toast.dismiss();
        toast.error("An error occurred during export.");
        trackError(e, 'MeasurementsCard - Failed Export', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      });
  };

  return (
    <div className="overflow-x-auto">
      <Toaster />
      <div className="flex space-x-4 justify-center mb-4">
        <button onClick={() => router.push(`/add-measurement`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Add Measurement</button>
        <button onClick={exportData} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Export Data</button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeasurementsCard;

