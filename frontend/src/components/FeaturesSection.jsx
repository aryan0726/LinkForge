function FeaturesSection() {
  const features = [
    {
      title: "Advanced Analytics",
      description:
        "Track clicks, devices, locations and performance of every link.",
    },
    {
      title: "Custom Aliases",
      description:
        "Create branded short links that are easy to remember.",
    },
    {
      title: "QR Code Generator",
      description:
        "Generate beautiful QR codes instantly for every short URL.",
    },
    {
      title: "Developer API",
      description:
        "Integrate LinkForge into your applications with our REST API.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto mt-20 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">
          Powerful Features
        </h2>

        <p className="text-gray-600 mt-4">
          Everything you need to manage, track and grow your links.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-2xl font-semibold mb-4">
              {feature.title}
            </h3>

            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;