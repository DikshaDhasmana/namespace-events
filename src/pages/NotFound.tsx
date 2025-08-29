import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const NotFound = () => {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const bgColor = theme === "dark" ? "bg-purple-950" : "bg-purple-50";
  const textColor = theme === "dark" ? "text-purple-200" : "text-purple-600";

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className={`text-xl ${textColor} mb-4`}>Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
