import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI, employeeAPI } from '../utils/api';

const SubmitReview = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  // Model ke mutabiq initial state
  const [formData, setFormData] = useState({
    ratings: {
      workQuality: 8, punctuality: 8, behavior: 8, teamwork: 8,
      communication: 8, technicalSkills: 8, problemSolving: 8, reliability: 8
    },
    employmentDetails: {
      designation: '', department: '',
      startDate: '', endDate: '', employmentType: 'full-time'
    },
    comment: '',
    wouldRehire: true
  });

  const findEmployee = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.search({ query: email });
      if (res.data.success && res.data.data.length > 0) {
        setEmployee(res.data.data[0]);
      } else {
        alert("Employee nahi mila. Email check karein.");
      }
    } catch (err) {
      alert("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [key]: Number(value) } // Number casting zaruri hai
    }));
  };

  const handleEmploymentChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      employmentDetails: { ...prev.employmentDetails, [key]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.comment.length < 50) return alert("Comment kam se kam 50 characters ka hona chahiye!");

    setLoading(true);
    try {
      const payload = {
        ...formData,
        employeeId: employee._id
      };
      
      const res = await reviewAPI.create(payload); // API Utility ka use
      
      if (res.data.success) {
        alert('Fabulous! Review Published Successfully ✅');
        navigate('/dashboard/company');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Check dates or daily limit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <h2 className="text-4xl font-black text-slate-900 mb-8 text-center font-serif">Employee Performance Rating</h2>
        
        {!employee ? (
          <div className="flex gap-4 bg-slate-50 p-4 rounded-3xl border border-dashed border-slate-200">
            <input 
              type="email" placeholder="Search Employee by Email" 
              className="flex-1 p-5 bg-white border-none rounded-2xl outline-none shadow-sm font-medium"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <button 
              onClick={findEmployee} 
              className="bg-indigo-600 text-white px-10 rounded-2xl font-black hover:bg-indigo-700 transition transform active:scale-95"
            >
              {loading ? 'Searching...' : 'Find'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-500">
            {/* Header: Selected Employee */}
            <div className="p-6 bg-indigo-600 rounded-[2.5rem] flex justify-between items-center text-white shadow-xl shadow-indigo-100">
              <div>
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Reviewing Talent</p>
                <h3 className="text-2xl font-black">{employee.firstName} {employee.lastName}</h3>
              </div>
              <button type="button" onClick={() => setEmployee(null)} className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition">Change User</button>
            </div>

            {/* Section 1: 8-Parameter Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(formData.ratings).map(key => (
                <div key={key} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-indigo-300 transition group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-hover:text-indigo-500 transition">{key}</label>
                  <input 
                    type="number" min="1" max="10" 
                    value={formData.ratings[key]} 
                    className="w-full bg-transparent font-black text-slate-800 text-xl outline-none" 
                    onChange={(e) => handleRatingChange(key, e.target.value)} 
                    required
                  />
                </div>
              ))}
            </div>

            {/* Section 2: Employment Logistics */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200 inline-block"></span> Work History Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Designation (e.g. Lead Designer)" required className="p-5 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm"
                  onChange={(e) => handleEmploymentChange('designation', e.target.value)} />
                
                <select className="p-5 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm font-bold text-slate-600" onChange={(e) => handleEmploymentChange('employmentType', e.target.value)}>
                  <option value="full-time">Full-Time Role</option>
                  <option value="part-time">Part-Time Role</option>
                  <option value="contract">Contractor</option>
                  <option value="internship">Internship</option>
                </select>

                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase">Employment Start</label>
                  <input type="date" required className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm"
                    onChange={(e) => handleEmploymentChange('startDate', e.target.value)} />
                </div>
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase">Employment End</label>
                  <input type="date" required className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm"
                    onChange={(e) => handleEmploymentChange('endDate', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 3: Professional Testimony */}
            <div className="space-y-4">
               <textarea 
                placeholder="Share a professional assessment of their skills and contribution (Minimum 50 characters)..." 
                required 
                className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] h-44 outline-none focus:ring-4 ring-indigo-50 transition font-medium"
                onChange={(e) => setFormData({...formData, comment: e.target.value})} 
               />
               <p className="text-[10px] text-slate-400 text-right pr-4 font-bold">Characters count: {formData.comment.length}</p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Publishing Review...' : 'Publish Official Assessment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitReview;