import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">IGA</span>
          </div>
          <p className="text-gray-400">
            Transform your gaming journey with expert-led courses and interactive learning experiences.
          </p>
          <div className="flex space-x-4">
            <a href="https://facebook.com" className="hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" className="hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://instagram.com" className="hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" className="hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://youtube.com" className="hover:text-primary transition-colors">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/courses" className="text-gray-400 hover:text-primary transition-colors">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-400 hover:text-primary transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/student/login" className="text-gray-400 hover:text-primary transition-colors">
                Student Login
              </Link>
            </li>
            <li>
              <Link to="/coach/login" className="text-gray-400 hover:text-primary transition-colors">
                Coach Login
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/help" className="text-gray-400 hover:text-primary transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-gray-400 hover:text-primary transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <span className="text-gray-400">
                123 Gaming Street<br />
                Los Angeles, CA 90001
              </span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary" />
              <a href="tel:+1234567890" className="text-gray-400 hover:text-primary transition-colors">
                +1 (234) 567-890
              </a>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <a href="mailto:contact@iga.com" className="text-gray-400 hover:text-primary transition-colors">
                contact@iga.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Interactive Gaming Academy. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/cookies" className="text-gray-400 hover:text-primary text-sm transition-colors">
                Cookies Policy
              </Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-primary text-sm transition-colors">
                Accessibility
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-primary text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
