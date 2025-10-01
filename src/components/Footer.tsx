import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="mt-20 pt-5 pb-12 px-4 sm:px-6 text-center" style={{ borderTop: '0.75px solid rgba(139, 92, 246, 0.1)' }}>
      <div className="flex items-center justify-center mb-4">
        <img 
          src="/Logo.png"
          alt="NAMESPACE"
          className="h-4 sm:h-5"
        />
      </div>
      
      {/* Legal Links */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4">
        <Link to="https://www.namespace.world/privacy-policy" className="text-gray-400 hover:text-namespace-purple text-xs sm:text-sm transition-colors">
          Privacy Policy
        </Link>
        <Link to="https://www.namespace.world/terms-of-use" className="text-gray-400 hover:text-namespace-purple text-xs sm:text-sm transition-colors">
          Terms of Use
        </Link>
        <Link to="https://www.namespace.world/branding" className="text-gray-400 hover:text-namespace-purple text-xs sm:text-sm transition-colors">
          Brand Guidelines
        </Link>
      </div>
      
      <p className="text-gray-400 text-xs sm:text-sm px-2">
        © 2025 Namespace Ecosystem India Pvt. Ltd.. Building the Global Ecosystem for Humans and Organizations in Tech.
      </p>
    </div>
  );
};

export default Footer;
