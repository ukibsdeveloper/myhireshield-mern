import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataRights = () => {
  const [visibility, setVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile ki current visibility status check karein
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/employees/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setVisibility(res.data.data.employee.profileVisible);
      }
    };
    checkStatus();
  }, []);

  const toggleVisibility = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Visibility update karne ka API call
      const res = await axios.put('http://localhost:5000/api/employees/visibility', 
        { profileVisible: !visibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setVisibility(!visibility);
        alert(`Profile is now ${!visibility ? 'Public' : 'Hidden'}!`);
      }
    } catch (err) {
      alert("Please give consent first in settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-3xl font-black text-slate-900">Privacy Control</h2>
          <p className="text-slate-400 mt-2">Manage your data visibility across the platform.</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between mb-8">
          <div>
            <p className="font-bold text-slate-800">Public Search</p>
            <p className="text-xs text-slate-400 font-medium">Allow companies to find you</p>
          </div>
          <button 
            onClick={toggleVisibility}
            disabled={loading}
            className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${visibility ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}
          >
            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
          </button>
        </div>

        <div className="space-y-4">
          <button className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition">Request Data Export (GDPR)</button>
          <button className="w-full py-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition">Delete My Account</button>
        </div>
      </div>
    </div>
  );
};

export default DataRights;