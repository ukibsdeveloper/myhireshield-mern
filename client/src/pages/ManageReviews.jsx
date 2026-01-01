import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/reviews/company', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setReviews(res.data.data);
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-10">Historical Feedback</h1>
        <div className="grid gap-6">
          {reviews.length > 0 ? reviews.map(r => (
            <div key={r._id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-lg text-indigo-600">{r.employeeId?.firstName} {r.employeeId?.lastName}</h3>
                  <p className="text-slate-400 italic">"{r.comment}"</p>
               </div>
               <span className="bg-slate-50 px-4 py-2 rounded-xl font-black text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          )) : <div className="text-center text-slate-400 font-bold p-20 bg-white rounded-3xl border border-dashed border-slate-200">No history found.</div>}
        </div>
      </div>
    </div>
  );
};
export default ManageReviews;