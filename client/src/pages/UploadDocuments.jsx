import React, { useState } from 'react';
import axios from 'axios';

const UploadDocuments = () => {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', msg: 'Please select a file!' });

    setLoading(true);
    const formData = new FormData();
    formData.append('document', file); // Field name matched with Multer
    formData.append('documentType', docType);
    formData.append('documentNumber', docNumber);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Document uploaded successfully!' });
        setFile(null); setDocNumber('');
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Upload failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
      <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black mb-6 text-center">Upload Documents</h2>
        {status.msg && <div className={`p-4 rounded-xl mb-4 text-center font-bold ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.msg}</div>}
        <form onSubmit={handleUpload} className="space-y-4">
          <select className="w-full p-4 bg-gray-50 border rounded-2xl" value={docType} onChange={(e)=>setDocType(e.target.value)}>
            <option value="aadhaar">Aadhaar Card</option>
            <option value="pan">PAN Card</option>
            <option value="experience_letter">Experience Letter</option>
          </select>
          <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl" placeholder="Document Number" value={docNumber} onChange={(e)=>setDocNumber(e.target.value)} />
          <input type="file" className="w-full p-4 border-2 border-dashed rounded-2xl" onChange={(e)=>setFile(e.target.files[0])} />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold">{loading ? 'Uploading...' : 'Upload Now'}</button>
        </form>
      </div>
    </div>
  );
};
export default UploadDocuments;