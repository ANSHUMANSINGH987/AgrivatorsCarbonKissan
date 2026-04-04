export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerLinks = [
    {
      title: "About Us",
      links: ["Our Story", "Science & Research"]
    },
    {
      title: "Connect with Us",
      links: ["Github", "Linkedin", "Instagram"]
    },
    {
      title: "Let Us Help You",
      links: [
        "Your Account",
        "App Download",
        "Help"
      ]
    }
  ];

  return (
    <footer className="w-full mt-20 relative z-20 font-sans">
      {/* Main footer content */}
      <div className="bg-black/40 w-full text-white py-16 px-6 sm:px-12">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 text-center pb-8 pt-4">
          {footerLinks.map((section, index) => (
            <div key={index} className="flex flex-col items-center">
              <h3 className="font-bold text-lg mb-5 tracking-wide">{section.title}</h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-white hover:text-gray-300 hover:underline text-sm transition-colors duration-200"
                      onClick={(e) => e.preventDefault()}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Copyright section */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/70 text-sm">&copy; 2026 Carbon Kissan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
