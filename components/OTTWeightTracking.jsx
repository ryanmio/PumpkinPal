'use client';
import { ResponsiveLine } from "@nivo/line";
import { useState, useEffect } from 'react';

// Custom tooltip component
const CustomTooltip = ({ point }) => {
  return (
    <div
      style={{
        background: 'white',
        padding: '9px 12px',
        border: '1px solid #ccc',
        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)', // Optional: added for a subtle shadow effect
      }}
    >
      <div style={{ fontStyle: 'italic', color: '#666' }}>
        {point.serieId}
      </div>
      <div>
         {point.data.xFormatted}: <strong>{point.data.yFormatted}</strong> OTT
      </div>
    </div>
  );
};

function LineChart(props) {
    // Assuming your x-axis data points are like this:
    const xDataPoints = ["DAP 10", "DAP 20", "DAP 30", "DAP 40", "DAP 50", "DAP 60", "DAP 70", "DAP 80", "DAP 90"];

    const [tickRotation, setTickRotation] = useState(0);

    useEffect(() => {
      const updateTickRotation = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth < 550) { // Assuming 768px is the breakpoint for mobile devices
          setTickRotation(-45);
        } else {
          setTickRotation(0);
        }
      };

      window.addEventListener('resize', updateTickRotation);
      updateTickRotation(); // Initial check

      return () => window.removeEventListener('resize', updateTickRotation);
    }, []);

    return (
      (<div {...props} style={{ height: '0', paddingBottom: '56.25%', position: 'relative' }}>
        <div style={{ height: '100%', width: '100%', position: 'absolute' }}>
          <ResponsiveLine
            data={[
              {
                id: "Primary",
                data: [
                  { x: "DAP 10", y: 43 },
                  { x: "DAP 20", y: 95 },
                  { x: "DAP 30", y: 137 },
                  { x: "DAP 40", y: 161 },
                  { x: "DAP 50", y: 182 },
                  { x: "DAP 60", y: 195 },
                  { x: "DAP 70", y: 204 },
                  { x: "DAP 80", y: 208 },
                  { x: "DAP 90", y: 211 },
                ],
              },
              {
                id: "Backup",
                data: [
                  { x: "DAP 10", y: 39 },
                  { x: "DAP 20", y: 87 },
                  { x: "DAP 30", y: 127 },
                  { x: "DAP 40", y: 144 },
                  { x: "DAP 50", y: 163 },
                  { x: "DAP 60", y: 171 },
                  { x: "DAP 70", y: 182 },
                  { x: "DAP 80", y: 185 },
                  { x: "DAP 90", y: 190 },
                ],
              },
            ]}
            margin={{ top: 10, right: 10, bottom: 50, left: 40 }} // Increased bottom margin for mobile
            xScale={{
              type: "point",
            }}
            yScale={{
              type: "linear",
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 16,
              tickValues: xDataPoints.slice(0, -1), // Exclude the last tick value
              tickRotation: tickRotation,
            }}
            axisLeft={{
              tickSize: 0,
              tickValues: 5,
              tickPadding: 16,
            }}
            colors={["#2563eb", "#e11d48"]}
            pointSize={6}
            useMesh={true}
            gridYValues={6}
            theme={{
              tooltip: {
                chip: {
                  borderRadius: "9999px",
                },
                container: {
                  fontSize: "12px",
                  textTransform: "capitalize",
                  borderRadius: "6px",
                },
              },
              grid: {
                line: {
                  stroke: "#f3f4f6",
                },
              },
            }}
            tooltip={({ point }) => <CustomTooltip point={point} />}
            role="application" />
        </div>
      </div>)
    );
  }

export default function OTTWeightTracking() {
  return (
    <section className="flex justify-center items-center w-full py-12 md:py-24 lg:py-32 bg-[#f2f2f2] dark:bg-[#333]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center">OTT Weight Tracking</h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center mx-auto">
              Estimate the weight of your pumpkins using the Over The Top (OTT) formula and track the progress over time.
            </p>
          </div>
          <LineChart className="w-full aspect-[16/9]" />
        </div>
      </div>
    </section>
  );
}

