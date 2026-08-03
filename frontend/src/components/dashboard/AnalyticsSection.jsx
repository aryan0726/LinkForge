import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", clicks: 1200 },
  { day: "Tue", clicks: 1800 },
  { day: "Wed", clicks: 1500 },
  { day: "Thu", clicks: 2500 },
  { day: "Fri", clicks: 2200 },
  { day: "Sat", clicks: 3200 },
  { day: "Sun", clicks: 4100 },
];

function AnalyticsSection() {
  return (
    <div className="grid grid-cols-3 gap-6 mt-8">
      {/* Analytics Chart */}

      <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            Click Analytics
          </h2>

          <select className="border border-gray-300 rounded-lg px-3 py-2 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Countries */}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">
          Top Countries
        </h2>

        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <span>🇮🇳 India</span>
            <span className="font-medium">
              56%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full w-[56%]"></div>
          </div>

          <div className="flex justify-between items-center">
            <span>🇺🇸 United States</span>
            <span className="font-medium">
              21%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full w-[21%]"></div>
          </div>

          <div className="flex justify-between items-center">
            <span>🇬🇧 United Kingdom</span>
            <span className="font-medium">
              9%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full w-[9%]"></div>
          </div>

          <div className="flex justify-between items-center">
            <span>🇨🇦 Canada</span>
            <span className="font-medium">
              5%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full w-[5%]"></div>
          </div>

          <div className="flex justify-between items-center">
            <span>🌎 Others</span>
            <span className="font-medium">
              9%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full w-[9%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSection;