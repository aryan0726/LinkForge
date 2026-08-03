import {
  FaLink,
  FaMousePointer,
  FaGlobe,
  FaChartLine,
} from "react-icons/fa";

function StatsCards() {
  const stats = [
    {
      title: "Total Links",
      value: "128",
      change: "+12.4%",
      icon: <FaLink />,
    },
    {
      title: "Total Clicks",
      value: "12,847",
      change: "+24.5%",
      icon: <FaMousePointer />,
    },
    {
      title: "Countries",
      value: "150",
      change: "+8.7%",
      icon: <FaGlobe />,
    },
    {
      title: "Growth Rate",
      value: "+24.5%",
      change: "+3.2%",
      icon: <FaChartLine />,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white
border
border-gray-200
rounded-2xl
p-6
shadow-sm
hover:shadow-lg
hover:-translate-y-1
transition-all
duration-300
"
        >
          {/* Icon */}

          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 text-xl mb-4">
            {stat.icon}
          </div>

          {/* Title */}

          <h3 className="text-gray-500 text-sm">
            {stat.title}
          </h3>

          {/* Value */}

          <p className="text-4xl font-bold mt-2">
            {stat.value}
          </p>

          {/* Growth */}

          <p className="text-green-600 text-sm font-medium mt-3">
            ↑ {stat.change} from last week
          </p>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;