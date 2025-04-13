
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto pt-8 pb-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
          <span>© {currentYear} FlashForge AI</span>
          <span className="hidden md:inline">•</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy Statement
          </Link>
          <span className="hidden md:inline">•</span>
          <Link to="/legal" className="hover:text-foreground transition-colors">
            Legal Notice
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
