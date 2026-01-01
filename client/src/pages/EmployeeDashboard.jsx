import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <span className="text-2xl font-black text-indigo-600 tracking-tighter">MyHireShield</span>
        <button onClick={logout} className="bg-rose-50 text-rose-600 px-6 py-2 rounded-full font-bold hover:bg-rose-100 transition">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-6">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900">Welcome back, {user?.firstName || 'Chief'}!</h1>
          <p className="text-slate-500 mt-2">Here's what's happening with your professional shield.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/employee/profile" className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
            <div className="text-4xl mb-4 group-hover:scale-110 transition">👤</div>
            <h3 className="text-xl font-bold text-slate-800">My Profile</h3>
            <p className="text-slate-400 text-sm mt-2">View and manage your public professional identity.</p>
          </Link>

          <Link to="/documents/upload" className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
            <div className="text-4xl mb-4 group-hover:scale-110 transition">🛡️</div>
            <h3 className="text-xl font-bold text-slate-800">Identity Shield</h3>
            <p className="text-slate-400 text-sm mt-2">Upload KYC to get your "Verified" badge.</p>
          </Link>

          <Link to="/data-rights" className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
            <div className="text-4xl mb-4 group-hover:scale-110 transition">⚙️</div>
            <h3 className="text-xl font-bold text-slate-800">Privacy Control</h3>
            <p className="text-slate-400 text-sm mt-2">Manage who can see your ratings and data.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;