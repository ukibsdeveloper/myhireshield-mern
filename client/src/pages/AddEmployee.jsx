import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', // Ab yahan real number aayega
    dateOfBirth: '', 
    gender: 'male',
    designation: '', 
    department: 'General'
  });

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cleanDOB = formData.dateOfBirth.replace(/-/g, ""); 

      const payload = {
        firstName: formData.firstName.trim().toUpperCase(),
        lastName: formData.lastName.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: cleanDOB,
        confirmPassword: cleanDOB,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        address: {
          street: 'Verified Enterprise Node',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001'
        },
        designation: formData.designation,
        department: formData.department || 'General'
      };

      // DEBUG: Payload check karne ke liye
      console.log("Attempting Registration with:", payload);

      const res = await axios.post('/api/auth/register/employee', payload); 

      /**
       * SUCCESS LOGIC RE-ENGINEERED:
       * Agar status code 200 ya 201 hai, toh registration success hai.
       * Database screenshot ne confirm kar diya hai ki user create ho raha hai.
       */
      if (res.status === 201 || res.status === 200 || res.data.success) {
        console.log("Backend Success Response:", res.data);
        alert("Employee Node Created Successfully! ✅\n\nLogin Email: " + payload.email + "\nDefault Password: " + cleanDOB);
        navigate('/dashboard/company');
      } else {
        // Yeh bohot rare case hai jab status success ho par backend mana kare
        alert(res.data.message || "Unexpected response from server");
      }

    } catch (err) {
      /**
       * CATCH BLOCK:
       * Yeh tabhi chalna chahiye jab status code 400, 401, 500 etc ho.
       */
      console.error("Full Error Object:", err);
      
      // Agar Backend ne Validation list bheji hai
      const backendErrors = err.response?.data?.errors;
      const backendMessage = err.response?.data?.message;

      if (backendErrors && backendErrors.length > 0) {
        alert(`Protocol Validation Failed: ${backendErrors[0].message || backendErrors[0].msg}`);
      } else if (backendMessage) {
        alert("Registration Error: " + backendMessage);
      } else {
        // Agar Axios response hi nahi la paya (Network issues)
        alert("Connection Timeout or Protocol Mismatch. Check Network Tab.");
      }
    } finally {
      setLoading(false);
    }
  };


  const inputClass = "p-4 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ring-[#4c8051]/20";

  return (
    <div className="min-h-screen bg-[#fcfaf9]">
      <Navbar scrolled={true} isAuthenticated={true} />
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-3xl">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-50">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-[#496279] rounded-2xl flex items-center justify-center text-white shadow-lg">
               <i className="fas fa-user-plus"></i>
            </div>
            <h2 className="text-3xl font-black text-[#496279] uppercase tracking-tighter">Register New Node</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <input type="text" placeholder="First Name" className={inputClass} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} required />
            <input type="text" placeholder="Last Name" className={inputClass} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} required />
            <input type="email" placeholder="Official Email" className={`${inputClass} col-span-2`} onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
            
            {/* Added Phone Input Field */}
            <input type="tel" placeholder="Phone Number (10 Digits)" className={`${inputClass} col-span-2`} onChange={(e)=>setFormData({...formData, phone: e.target.value})} required maxLength="10" />
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Date of Birth</label>
              <input type="date" className={inputClass} onChange={(e)=>setFormData({...formData, dateOfBirth: e.target.value})} required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Gender Node</label>
              <select className={inputClass} value={formData.gender} onChange={(e)=>setFormData({...formData, gender: e.target.value})}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <input type="text" placeholder="Designation" className={`${inputClass} col-span-2`} onChange={(e)=>setFormData({...formData, designation: e.target.value})} required />
            
            <button type="submit" disabled={loading} className="col-span-2 bg-[#496279] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#3a4e61] transition-all shadow-xl active:scale-95 disabled:opacity-50">
              {loading ? "Synchronizing Node..." : "Deploy Employee Node"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddEmployee;