import React, { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender, VisibilityState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { toast, Toaster } from 'react-hot-toast';
import { showDeleteConfirmation } from '../../../components/ui/Alert';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../../utilities/error-analytics';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuContent, DropdownMenu, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import MoreHorizontalIcon from '../../../public/icons/MoreHorizontalIcon';
import { Checkbox } from "@/components/ui/checkbox";

const MeasurementsCard = ({ measurements, pumpkinId, pollinationDate, userPreferredUnit }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false); // State to track accordion expansion
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [columnVisibility, setColumnVisibility] = useState({});

  useEffect(() => {
    console.log("User's preferred unit:", userPreferredUnit); // Log 1
  }, [userPreferredUnit]);

  useEffect(() => {
    const loadData = async () => {
      // Simulate fetching data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Remove or replace with actual data fetching
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Function to check if the device is mobile based on the width
    const isMobile = window.innerWidth < 768; // Example breakpoint for mobile

    if (isMobile) {
      // Adjust visibility for hidable columns on mobile
      setColumnVisibility({
        endToEnd: false, // Assuming 'endToEnd' is hidable
        sideToSide: false, // Assuming 'sideToSide' is hidable
        circumference: false, // Assuming 'circumference' is hidable
      });
    }
  }, []);

  // Function to convert units from cm to in
  const convertCmToIn = (cm) => {
    const inches = (cm / 2.54).toFixed(2);
    console.log(`Converting ${cm} cm to inches:`, inches); // Log 2
    return inches;
  };

  // Function to convert weight from kg to lbs
  const convertKgToLbs = (kg) => {
    const pounds = (kg * 2.20462).toFixed(2);
    console.log(`Converting ${kg} kg to pounds:`, pounds); // Log 3
    return pounds;
  };

  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Date',
      enableHiding: false,
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
      enableHiding: false,
    },
    {
      accessorKey: 'endToEnd',
      header: 'End to End',
      enableHiding: true,
      cell: ({ row }) => {
        const originalValue = row.original.endToEnd;
        const value = userPreferredUnit === 'in' ? convertCmToIn(originalValue) : originalValue;
        const unitLabel = userPreferredUnit ? userPreferredUnit : 'cm'; // Fallback to 'cm' if undefined
        console.log(`Final value for 'End to End':`, value, unitLabel); // Adjusted log
        return `${value} ${unitLabel}`;
      },
    },
    {
      accessorKey: 'sideToSide',
      header: 'Side to Side',
      enableHiding: true,
      cell: ({ row }) => {
        const originalValue = row.original.sideToSide;
        const value = userPreferredUnit === 'in' ? convertCmToIn(originalValue) : originalValue;
        const unitLabel = userPreferredUnit ? userPreferredUnit : 'cm'; // Fallback to 'cm' if undefined
        console.log(`Final value for 'Side to Side':`, value, unitLabel); // Adjusted log
        return `${value} ${unitLabel}`;
      },
    },
    {
      accessorKey: 'circumference',
      header: 'Circumference',
      enableHiding: true,
      cell: ({ row }) => {
        const originalValue = row.original.circumference;
        const value = userPreferredUnit === 'in' ? convertCmToIn(originalValue) : originalValue;
        const unitLabel = userPreferredUnit ? userPreferredUnit : 'cm'; // Fallback to 'cm' if undefined
        console.log(`Final value for 'Circumference':`, value, unitLabel); // Adjusted log
        return `${value} ${unitLabel}`;
      },
    },
    {
      accessorKey: 'estimatedWeight',
      header: 'OTT Weight',
      enableHiding: false,
      cell: ({ row }) => {
        const weight = row.original.estimatedWeight;
        const measurementUnit = row.original.measurementUnit; // 'cm' or 'in'
        const isMetric = measurementUnit === 'cm';
        const convertedWeight = isMetric && userPreferredUnit === 'in' ? convertKgToLbs(weight) : weight;
        const unitLabel = userPreferredUnit === 'in' ? 'lbs' : 'kg';
        console.log(`Final value for 'OTT Weight':`, Math.round(convertedWeight), unitLabel); // Log for debugging
        return `${Math.round(convertedWeight)} ${unitLabel}`;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full p-1 w-6 h-6" size="icon" variant="ghost">
                <MoreHorizontalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push(`/pumpkin/${pumpkinId}/edit-measurement/${row.original.id}`)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => deleteMeasurement(row.original.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: measurements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
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
          <div className="flex justify-center md:justify-end gap-4 w-full md:w-auto pb-4 md:pb-0">
            <Button variant="outline" onClick={() => router.push(`/add-measurement`)}>Add Measurement</Button>
            
            {/* Columns dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"> 
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter(column => column.getCanHide()).map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={() => column.toggleVisibility()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hide the Export Data button on mobile using the `hidden sm:inline-block` classes */}
            <Button className="md:mr-6 hidden sm:inline-block" variant="outline" onClick={exportData}>Export Data</Button>
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
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase text-center"
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
                          className="px-6 py-4 whitespace-nowrap text-center"
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
