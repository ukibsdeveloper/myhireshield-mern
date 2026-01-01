import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/employees/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError("Profile data load nahi hua. Registration complete karein.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold text-indigo-600 animate-pulse">Establishing Secure Connection...</div>;

  // Agar database mein profile nahi hai toh ye fallback dikhega
  const profile = data?.employee || user?.profile; 

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 h-40"></div>
        <div className="px-10 pb-12 text-center">
          <div className="relative -mt-20 mb-6 inline-block">
            <div className="h-40 w-40 bg-white rounded-full p-2 shadow-2xl mx-auto">
              <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center text-6xl font-black text-indigo-600 border-4 border-white">
                {profile?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 capitalize">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-indigo-600 font-bold mb-10">{profile?.email || user?.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile</span>
              <p className="text-lg font-bold text-slate-800">{profile?.phone || "Update Needed"}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
              <p className="text-lg font-bold text-slate-800">{profile?.totalExperience || 0} Years</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</span>
              <p className={`text-lg font-black ${profile?.verified ? 'text-green-600' : 'text-orange-500'}`}>
                {profile?.verified ? 'Verified Badge ✓' : 'ID Pending ⏳'}
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Score</span>
              <p className="text-lg font-black text-indigo-600">{profile?.overallScore || 0}% Rank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;