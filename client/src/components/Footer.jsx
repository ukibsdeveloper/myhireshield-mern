import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-[#fcfaf9] pt-16 md:pt-24 pb-12 border-t border-[#496279]/10 overflow-hidden selection:bg-[#4c8051]/20">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#dd8d88]/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4c8051]/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-24">
          
          {/* Brand Section */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              {/* Original Logo Implementation */}
              <div className="h-12 w-12 overflow-hidden rounded-xl shadow-lg group-hover:rotate-3 transition-transform duration-500 bg-white">
                <img 
                  src="/logo.jpg" 
                  alt="MyHireShield Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#496279] tracking-tighter uppercase leading-none">
                  Hire<span className="text-[#4c8051]">Shield</span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#dd8d88] mt-1">Verification Bureau</span>
              </div>
            </Link>
            
            {/* New Content Writer Text */}
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium opacity-90">
              MyHireShield is a well-structured & high-tech background verification platform that offers accurate employee data that ensures trustworthiness and helps to make transparent hiring decisions.
            </p>

            <div className="flex gap-3">
              {['linkedin-in', 'x-twitter', 'instagram', 'facebook-f'].map(s => (
                <a 
                  key={s} 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-[#496279]/5 border border-slate-100 flex items-center justify-center text-[#496279] hover:bg-[#496279] hover:text-white transition-all duration-300"
                >
                  <i className={`fab fa-${s} text-xs`}></i>
                </a>
              ))}
            </div>
          </div>
          
          {/* Simple & Relatable Navigation */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-12">
            
            {/* Column 1: For Employees */}
            <div className="flex flex-col">
              <h4 className="font-black text-[#496279] text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#4c8051]"></span> For Candidates
              </h4>
              <ul className="space-y-4">
                <li><Link to="/register/employee" className="footer-link">Join as Employee</Link></li>
                <li><Link to="/dashboard/employee" className="footer-link">Check My Trust Score</Link></li>
                <li><Link to="/verify/documents" className="footer-link">Verify My Identity</Link></li>
                <li><Link to="/consent" className="footer-link">My Privacy Consent</Link></li>
              </ul>
            </div>

            {/* Column 2: For Companies */}
            <div className="flex flex-col">
              <h4 className="font-black text-[#496279] text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#dd8d88]"></span> For Employers
              </h4>
              <ul className="space-y-4">
                <li><Link to="/register/company" className="footer-link">Register Company</Link></li>
                <li><Link to="/employee/search" className="footer-link">Search Candidates</Link></li>
                <li><Link to="/dashboard/company" className="footer-link">Company Dashboard</Link></li>
                <li><Link to="/review/submit" className="footer-link">Submit Audit Report</Link></li>
                <li><Link to="/review/manage" className="footer-link">Manage Employee History</Link></li>
              </ul>
            </div>

            {/* Column 3: Support & Legal */}
            <div className="flex flex-col">
              <h4 className="font-black text-[#496279] text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#496279]"></span> Help & Legal
              </h4>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                <li><Link to="/contact" className="footer-link">Contact Support</Link></li>
                <li><Link to="/faq" className="footer-link">Help Center (FAQ)</Link></li>
                <li><Link to="/about" className="footer-link">About MyHireShield</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-200/60 flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 order-2 lg:order-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 MyHireShield. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4c8051]/5 rounded-full border border-[#4c8051]/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4c8051] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4c8051]"></span>
              </span>
              <span className="text-[9px] font-black text-[#4c8051] uppercase tracking-[0.1em]">System Secured</span>
            </div>
          </div>
          
          <div className="flex gap-x-6 gap-y-2 order-1 lg:order-2">
            <Link to="/privacy" className="text-[10px] font-black text-slate-400 hover:text-[#496279] transition-colors uppercase tracking-widest">GDPR Ready</Link>
            <Link to="/terms" className="text-[10px] font-black text-slate-400 hover:text-[#496279] transition-colors uppercase tracking-widest">User Agreement</Link>
          </div>
        </div>
      </div>

      {/* Tailwind Utility for Footer Links */}
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-link {
          @apply text-[13px] font-bold text-slate-400 hover:text-[#4c8051] transition-all duration-200 block;
        }
      `}} />
    </footer>
  );
};

export default Footer;