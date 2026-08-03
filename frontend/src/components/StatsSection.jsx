function StatsSection() {
  const stats = [
    {
      value: "10K+",
      label: "Links Created",
    },
    {
      value: "50K+",
      label: "Clicks Tracked",
    },
    {
      value: "150+",
      label: "Countries Reached",
    },
    {
      value: "99.9%",
      label: "Uptime",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm"
          >
            <h3 className="text-3xl font-bold text-orange-500">
              {stat.value}
            </h3>

            <p className="text-gray-600 mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;