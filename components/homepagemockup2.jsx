/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/GgmhaF5CLIf
 */
import { ResponsiveLine } from "@nivo/line"
import { Input } from "@/components/ui/input"

export function homepagemockup2() {
  return (
    (<main className="flex flex-col items-center justify-center space-y-12">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Welcome to PumpkinPal</h1>
              <p
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Your open-source companion for growing pumpkins. Track, analyze, and share your pumpkin's journey.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f2f2f2] dark:bg-[#333]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">OTT Weight Tracking</h2>
              <p
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Estimate the weight of your pumpkins using the Over The Top (OTT) formula and track the progress over
                time.
              </p>
            </div>
            <LineChart className="w-full aspect-[16/9]" />
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">GPC Search</h2>
              <p
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Find any grower, pumpkin, or site and get a comprehensive overview, rankings, and stats for each search
                result.
              </p>
            </div>
            <Input className="w-full max-w-md mx-auto" placeholder="Search..." type="search" />
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f2f2f2] dark:bg-[#333]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Image Gallery</h2>
              <p
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Capture your pumpkin's journey with photos. Each image is associated with the relevant pumpkin and
                displays its stats like DAP (Days After Pollination) and date.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <img
                alt="Placeholder"
                className="aspect-square object-cover"
                height="200"
                src="/placeholder.svg"
                width="200" />
              <img
                alt="Placeholder"
                className="aspect-square object-cover"
                height="200"
                src="/placeholder.svg"
                width="200" />
              <img
                alt="Placeholder"
                className="aspect-square object-cover"
                height="200"
                src="/placeholder.svg"
                width="200" />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Mission</h2>
              <p
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Empowering the pumpkin growing community by providing accessible and enjoyable tools. We envision a
                future with more and heavier pumpkins at weigh-offs, and are committed to the continuous development and
                improvement of PumpkinPal.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f2f2f2] dark:bg-[#333]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Always Free</h2>
              <p
                className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                PumpkinPal is committed to remaining free for all users. We believe in the power of community and the
                importance of accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>)
  );
}


function LineChart(props) {
  return (
    (<div {...props}>
      <ResponsiveLine
        data={[
          {
            id: "Desktop",
            data: [
              { x: "Jan", y: 43 },
              { x: "Feb", y: 137 },
              { x: "Mar", y: 61 },
              { x: "Apr", y: 145 },
              { x: "May", y: 26 },
              { x: "Jun", y: 154 },
            ],
          },
          {
            id: "Mobile",
            data: [
              { x: "Jan", y: 60 },
              { x: "Feb", y: 48 },
              { x: "Mar", y: 177 },
              { x: "Apr", y: 78 },
              { x: "May", y: 96 },
              { x: "Jun", y: 204 },
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
