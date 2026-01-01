import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EmployeeSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Backend controller 'query' parameter expect kar raha hai
      const res = await axios.get(`http://localhost:5000/api/employees/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Talent Shield Search</h1>
        
        {/* Search Bar */}
        <div className="flex gap-4 bg-white p-3 rounded-[2rem] shadow-xl mb-12 border border-slate-100">
          <input 
            type="text" 
            className="flex-1 px-6 py-2 outline-none text-lg font-medium"
            placeholder="Search by name or email..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-10 py-4 rounded-[1.5rem] font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6">
          {results.length > 0 ? results.map(emp => (
            <div key={emp._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-xl transition-all">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-indigo-600 border-2 border-white shadow-inner">
                  {emp.firstName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{emp.firstName} {emp.lastName}</h3>
                  <p className="text-slate-400 font-medium">{emp.currentDesignation || 'Verified Professional'}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Trust Score</p>
                  <p className="text-2xl font-black text-indigo-600">{emp.overallScore}%</p>
                </div>
                <Link 
                  to={`/employee/${emp._id}`} 
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )) : !loading && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="text-5xl mb-4 text-slate-200">🔍</div>
              <p className="text-slate-400 font-bold">No visible profiles found. Try a different name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSearch;