
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-white border-t border-love-100">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart size={18} className="text-love-500 fill-love-500 mr-2" />
          <span className="font-handwritten text-xl text-love-500">One Year With You</span>
          <Heart size={18} className="text-love-500 fill-love-500 ml-2" />
        </div>
        <p className="text-gray-600 text-sm">
          Made with love, for the love of my life.
        </p>
        <p className="text-gray-400 text-xs mt-2">
          © {new Date().getFullYear()} - Forever Yours
        </p>
      </div>
    </footer>
  );
};

export default Footer;
