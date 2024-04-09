import React, { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { toast, Toaster } from 'react-hot-toast';
import { showDeleteConfirmation } from '../../../components/ui/Alert';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../../utilities/error-analytics';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const MeasurementsCard = ({ measurements, pumpkinId, pollinationDate }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false); // State to track accordion expansion
  const [isLoading, setIsLoading] = useState(true); // Add this line

  useEffect(() => {
    const loadData = async () => {
      // Simulate fetching data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Remove or replace with actual data fetching
      setIsLoading(false);
    };

    loadData();
  }, []);

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
      cell: ({ row }) => `${row.original.endToEnd} ${row.original.measurementUnit}`,
    },
    {
      accessorKey: 'sideToSide',
      header: 'Side to Side',
      cell: ({ row }) => `${row.original.sideToSide} ${row.original.measurementUnit}`,
    },
    {
      accessorKey: 'circumference',
      header: 'Circumference',
      cell: ({ row }) => `${row.original.circumference} ${row.original.measurementUnit}`,
    },
    {
      accessorKey: 'estimatedWeight',
      header: 'OTT Weight',
      cell: ({ row }) => {
        const weight = row.original.estimatedWeight;
        const measurementUnit = row.original.measurementUnit; // 'cm' or 'in'
        const isMetric = measurementUnit === 'cm';
        const convertedWeight = isMetric ? weight * 0.453592 : weight; // Convert lbs to kg if metric
        const unitLabel = isMetric ? 'kg' : 'lbs';
        return `${Math.round(convertedWeight)} ${unitLabel}`;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => router.push(`/pumpkin/${pumpkinId}/edit-measurement/${row.original.id}`)}
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

  // Function to toggle the accordion state
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine the measurements to display
  const displayedMeasurements = isExpanded ? measurements : measurements.slice(-5);

  return (
    <div className="md:col-span-2">
      <Card className={`w-full ${isLoading ? 'min-h-[20rem]' : 'min-h-[10rem]'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center pb-0">
          <CardHeader className="w-full md:w-auto">
            <CardTitle>Measurements</CardTitle>
          </CardHeader>
          <div className="flex justify-center md:justify-end gap-4 w-full md:w-auto mt-4 mt-0 pb-4 md:pb-0">
            <Button className="md:mr-2" variant="outline" onClick={() => router.push(`/add-measurement`)}>Add Measurement</Button>
            <Button className="md:mr-6" variant="outline" onClick={exportData}>Export Data</Button>
          </div>
        </div>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[10rem]">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Toaster />
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
                  {displayedMeasurements.map((measurement, index) => (
                    <tr key={measurement.id}>
                      {table.getRowModel().rows.find(row => row.original.id === measurement.id).getVisibleCells().map(cell => (
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
          )}
          {/* Button to toggle the accordion */}
          <div className="flex justify-center mt-4">
            <Button onClick={toggleAccordion}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeasurementsCard;
