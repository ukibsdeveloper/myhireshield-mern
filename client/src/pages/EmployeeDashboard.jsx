import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState(JSON.parse(localStorage.getItem('user'))); // Direct storage access
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetching from the endpoint defined in your employee.routes.js
        const res = await axios.get('/api/employees/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          // Setting the nested employee object from your controller's response
          setEmployeeData(res.data.data.employee || res.data.data);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
    else setLoading(false);
  }, [user, navigate]);

  // Real data from DB
  const shieldScore = employeeData?.overallScore || 0; 
  const totalAudits = employeeData?.totalReviews || 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf9]">
      <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-[#496279]">
        Syncing Integrity Node...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf9] font-sans">
      <Navbar scrolled={true} isAuthenticated={true} user={user} />
      
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        
        {/* SECTION 1: THE GAUGE (REAL DATA) */}
        <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-2xl mb-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="flex-1 bg-red-400"></div>
            <div className="flex-1 bg-yellow-400"></div>
            <div className="flex-1 bg-[#4c8051]"></div>
          </div>

          <h2 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-10">Professional Integrity Index</h2>
          
          <div className="relative inline-block scale-110">
             <h1 className="text-9xl font-black tracking-tighter text-[#496279]">{shieldScore}%</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2" style={{ color: shieldScore >= 75 ? '#4c8051' : '#496279' }}>
               Status: {shieldScore >= 75 ? 'Verified Elite Member' : 'Stable Node Status'}
             </p>
          </div>

          <div className="mt-12 max-w-md mx-auto border-t border-slate-50 pt-8">
             <p className="text-slate-400 text-[10px] font-bold uppercase leading-relaxed tracking-wider">
               Aggregated from <span className="text-[#496279] font-black">{totalAudits} Verified Enterprise Audits</span>. 
               Last Sync: {new Date().toLocaleDateString('en-GB')}
             </p>
          </div>
        </div>

        {/* SECTION 2: ACCESS & COMPLIANCE */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#496279] rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden group">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Integrity Ledger</h3>
            <p className="text-white/50 text-[11px] font-bold uppercase leading-relaxed mb-10">
              Access full behavioral trajectory and re-hire eligibility nodes verified by employers.
            </p>
            <Link to="/reputation-report" className="block w-full bg-[#4c8051] text-center py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-[#3d6942] transition-colors">
              Open Full Report
            </Link>
          </div>

          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col justify-center shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#496279]">
                    <i className="fas fa-fingerprint text-xl"></i>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Compliance Check</p>
                   <p className="text-sm font-black text-[#496279] uppercase">
                    Status: {employeeData?.verified ? 'KYC Verified' : 'KYC Pending'}
                   </p>
                </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
               Enterprise nodes are responsible for asset validation. Your digital footprint is secured.
             </p>
          </div>
        </div>

        <div className="mt-20 text-center opacity-30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
              HireShield Integrity Terminal // Subject ID: {user?._id?.toUpperCase()}
            </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;