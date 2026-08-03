function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <div>
            <h2 className="text-2xl font-bold text-orange-500">
              LinkForge
            </h2>

            <p className="text-gray-600 mt-2">
              Smart URL Management Platform
            </p>
          </div>

          <div className="flex gap-8 text-gray-600">
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">Docs</a>
            <a href="#">Contact</a>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
          © 2026 LinkForge. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;