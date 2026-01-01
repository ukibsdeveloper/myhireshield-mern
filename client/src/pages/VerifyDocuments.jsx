import React, { useState, useEffect } from 'react';
import { documentAPI } from '../utils/api'; // Aapke api.js ka reference

const VerifyDocuments = () => {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        // Pending documents fetch karne ka logic
        const res = await documentAPI.getMyDocuments(); 
        if (res.data.success) setPendingDocs(res.data.data);
      } catch (err) { console.error("Error fetching queue"); }
      finally { setLoading(false); }
    };
    fetchQueue();
  }, []);

  const handleAction = async (id, status) => {
    try {
      // Document verify karne ka API call
      const res = await documentAPI.verify(id, status, "Verified by Admin");
      if (res.data.success) {
        alert(`Document ${status} successfully!`);
        setPendingDocs(prev => prev.filter(doc => doc._id !== id));
      }
    } catch (err) { alert("Verification failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Verification Queue</h1>
      <div className="grid gap-6">
        {pendingDocs.length > 0 ? pendingDocs.map(doc => (
          <div key={doc._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex justify-between items-center border border-slate-100">
            <div>
              <h3 className="text-xl font-bold capitalize">{doc.employeeId?.firstName} {doc.employeeId?.lastName}</h3>
              <p className="text-indigo-600 font-bold uppercase text-xs">{doc.documentType}: {doc.documentNumber}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleAction(doc._id, 'verified')} className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-600 transition shadow-lg shadow-emerald-100">Approve</button>
              <button onClick={() => handleAction(doc._id, 'rejected')} className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black hover:bg-rose-600 transition shadow-lg shadow-rose-100">Reject</button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No documents pending for verification.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyDocuments;