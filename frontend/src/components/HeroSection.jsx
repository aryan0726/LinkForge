function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-16 px-6">
      <p className="text-orange-500 font-semibold mb-4">
        Smart URL Management Platform
      </p>

      <h1 className="text-5xl md:text-6xl font-bold max-w-4xl leading-tight">
        Smart Links.
        <br />
        Powerful Insights.
      </h1>

      <p className="text-gray-600 text-lg max-w-2xl mt-6">
        Shorten, track and analyze every click with
        LinkForge. Create branded links, monitor
        analytics and grow your audience.
      </p>

      <div className="flex gap-4 mt-10">
        <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium">
          Get Started
        </button>

        <button className="border border-gray-300 px-8 py-3 rounded-lg font-medium">
          Learn More
        </button>
      </div>
    </section>
  );
}

export default HeroSection;