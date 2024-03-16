'use client';
import { ResponsiveLine } from "@nivo/line";

function LineChart(props) {
    return (
      (<div {...props}>
        <ResponsiveLine
          data={[
            {
              id: "Desktop",
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
              id: "Mobile",
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
          margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
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
          role="application" />
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