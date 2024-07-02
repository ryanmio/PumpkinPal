import React, { useState, useEffect, useMemo } from 'react';
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

const MeasurementsCard = ({ measurements, pumpkinId, pollinationDate, userPreferredUnit, pumpkin }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false); // State to track accordion expansion
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [columnVisibility, setColumnVisibility] = useState({
    ott: false, // OTT column hidden by default
  });

  useEffect(() => {
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
        ott: false, // OTT column hidden by default
      });
    }
  }, []);

  // Function to convert units from cm to in
  const convertCmToIn = (cm) => {
    const inches = parseFloat((cm / 2.54).toFixed(2));
    return Math.round(inches * 2) / 2; // Now returns a number rounded to the nearest 0.5
  };

  // Function to convert units fro// Function to convert units from in to cm
const convertInToCm = (inches) => {
  return parseFloat((inches * 2.54).toFixed(2));
};

  // Function to convert weight from kg to lbs
  const convertKgToLbs = (kg) => {
    const pounds = parseFloat((kg * 2.20462).toFixed(2));
    return Math.round(pounds * 2) / 2; // Now returns a number rounded to the nearest 0.5
  };

  // Function to convert weight from lbs to kg
  const convertLbsToKg = (lbs) => {
    return lbs * 0.45359237;
  };

  // Function to round to the nearest half
  const roundToNearestHalf = (value) => {
    return Math.round(value * 2) / 2;
  };

  // Function to calculate estimated weight
  const calculateEstimatedWeight = (endToEnd, sideToSide, circumference, measurementUnit) => {
    let ott = parseFloat(endToEnd) + parseFloat(sideToSide) + parseFloat(circumference);
    if (measurementUnit === 'cm') {
      ott /= 2.54;  // Convert cm to inches for the calculation
    }
    let weight = (((14.2 / (1 + 7.3 * Math.pow(2, -(ott) / 96))) ** 3 + (ott / 51) ** 2.91) - 8) * 0.993;
  
    // If weight is less than 0, set it to 0
    if (weight < 0) {
      weight = 0;
    }
  
    return weight;  // Return as a number, not rounded
  };

  const processedMeasurements = useMemo(() => {
    console.log("Raw measurements:", measurements);
    
    // First, convert all measurements
    const convertedMeasurements = measurements.map((measurement) => {
      const convertedMeasurement = { ...measurement };
  
      // Convert measurements to user's preferred unit
      if (userPreferredUnit === 'in' && measurement.measurementUnit === 'cm') {
        console.log("Converting measurement from cm to in:", measurement);
        convertedMeasurement.endToEnd = convertCmToIn(measurement.endToEnd);
        convertedMeasurement.sideToSide = convertCmToIn(measurement.sideToSide);
        convertedMeasurement.circumference = convertCmToIn(measurement.circumference);
        // Recalculate the weight based on the converted measurements
        convertedMeasurement.estimatedWeight = calculateEstimatedWeight(
          convertedMeasurement.endToEnd,
          convertedMeasurement.sideToSide,
          convertedMeasurement.circumference,
          'in'
        );
      } else if (userPreferredUnit === 'cm' && measurement.measurementUnit === 'in') {
        console.log("Converting measurement from in to cm:", measurement);
        convertedMeasurement.endToEnd = convertInToCm(measurement.endToEnd);
        convertedMeasurement.sideToSide = convertInToCm(measurement.sideToSide);
        convertedMeasurement.circumference = convertInToCm(measurement.circumference);
        // Recalculate the weight based on the converted measurements
        convertedMeasurement.estimatedWeight = calculateEstimatedWeight(
          convertedMeasurement.endToEnd,
          convertedMeasurement.sideToSide,
          convertedMeasurement.circumference,
          'cm'
        );
      }
  
      console.log("Converted measurement:", convertedMeasurement);
      return convertedMeasurement;
    });
  
    // Then, calculate gain and daily gain
    const finalMeasurements = convertedMeasurements.map((measurement, index) => {
      if (index === 0) {
        measurement.gain = 0;
        measurement.dailyGain = 0;
      } else {
        const prevMeasurement = convertedMeasurements[index - 1];
        const gain = measurement.estimatedWeight - prevMeasurement.estimatedWeight;
        const daysBetween = (new Date(measurement.timestamp).getTime() - new Date(prevMeasurement.timestamp).getTime()) / (1000 * 3600 * 24);
        const dailyGain = daysBetween ? gain / daysBetween : 0;
        measurement.gain = gain;
        measurement.dailyGain = dailyGain;
      }
      return measurement;
    });
  
    console.log("Final processed measurements:", finalMeasurements);
    return finalMeasurements;
  }, [measurements, userPreferredUnit]);

  console.log("Final processed measurements:", processedMeasurements);

  const columns = useMemo(() => [
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
        const value = roundToNearestHalf(row.original.endToEnd);
        const unitLabel = userPreferredUnit === 'in' ? 'in' : 'cm';
        console.log("Displaying endToEnd:", value, unitLabel);
        return `${value} ${unitLabel}`;
      },
    },
    {
      accessorKey: 'sideToSide',
      header: 'Side to Side',
      enableHiding: true,
      cell: ({ row }) => {
        const value = roundToNearestHalf(row.original.sideToSide);
        const unitLabel = userPreferredUnit === 'in' ? 'in' : 'cm';
        console.log("Displaying sideToSide:", value, unitLabel);
        return `${value} ${unitLabel}`;
      },
    },
    {
      accessorKey: 'circumference',
      header: 'Circumference',
      enableHiding: true,
      cell: ({ row }) => {
        const value = roundToNearestHalf(row.original.circumference);
        const unitLabel = userPreferredUnit === 'in' ? 'in' : 'cm';
        console.log("Displaying circumference:", value, unitLabel);
        return `${value} ${unitLabel}`;
      },
    },
    {
      accessorKey: 'estimatedWeight',
      header: 'OTT Weight',
      enableHiding: false,
      cell: ({ row }) => {
        const weight = row.original.estimatedWeight;
        const unitLabel = userPreferredUnit === 'in' ? 'lbs' : 'kg';
        const displayWeight = unitLabel === 'kg' ? weight * 0.453592 : weight; // Convert to kg if necessary
        console.log("Displaying estimatedWeight:", displayWeight, unitLabel);
        return `${Math.round(displayWeight)} ${unitLabel}`;
      },
    },
    {
      id: 'ott',
      header: 'OTT',
      enableHiding: true,
      isVisible: false, // This column is hidden by default
      cell: ({ row }) => {
        const endToEnd = parseFloat(row.original.endToEnd);
        const sideToSide = parseFloat(row.original.sideToSide);
        const circumference = parseFloat(row.original.circumference);
        const ott = endToEnd + sideToSide + circumference; // Calculate OTT
        const value = userPreferredUnit === 'in' ? roundToNearestHalf(convertCmToIn(ott)) : roundToNearestHalf(ott);
        const unitLabel = userPreferredUnit ? userPreferredUnit : 'cm'; // Fallback to 'cm' if undefined
        const numericValue = Number(value); // Ensure it's a number
        if (!isNaN(numericValue)) { // Check if it's not NaN
          console.log("Displaying OTT:", numericValue, unitLabel);
          return `${numericValue} ${unitLabel}`;
        } else {
          console.error('Value is not a number:', value);
          return `Invalid Value ${unitLabel}`;
        }
      },
    },
    {
      id: 'gain',
      header: 'Gain',
      cell: ({ row }) => {
        const unitLabel = userPreferredUnit === 'in' ? 'lbs' : 'kg'; // Assuming the unit conversion for weight is already handled
        console.log("Displaying gain:", row.original.gain, unitLabel);
        return `${row.original.gain.toFixed(2)} ${unitLabel}`;
      },
    },
    {
      id: 'dailyGain',
      header: 'Daily Gain',
      cell: ({ row }) => {
        const formattedDailyGain = row.original.dailyGain.toFixed(2);
        const prefix = row.original.dailyGain >= 0 ? '+' : '';
        console.log("Displaying dailyGain:", formattedDailyGain);
        return `${prefix}${formattedDailyGain}`;
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
              <DropdownMenuItem onSelect={() => router.push(`/edit-measurement/${pumpkinId}/${row.original.id}`)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => deleteMeasurement(row.original.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [pollinationDate, userPreferredUnit, measurements]);

  const table = useReactTable({
    data: processedMeasurements, // Use processed measurements here
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
        a.download = `PumpkinPal_${pumpkin ? pumpkin.name : 'Unknown'}_${date}.csv`;
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