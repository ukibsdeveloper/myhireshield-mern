import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, reviewAPI } from '../utils/api';

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getCompanyAnalytics();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="MyHireShield" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
                MyHireShield
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-green-500"></i>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalReviews || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-green-600 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Employees Reviewed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Verifications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalVerifications || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-check-circle text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/employee/search" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-green-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Search Employees</h3>
              <p className="text-sm text-gray-600">Find and verify candidates</p>
            </div>
          </Link>

          <Link to="/review/submit" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-plus text-blue-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Review</h3>
              <p className="text-sm text-gray-600">Rate an employee</p>
            </div>
          </Link>

          <Link to="/review/manage" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-edit text-purple-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Reviews</h3>
              <p className="text-sm text-gray-600">Edit or delete reviews</p>
            </div>
          </Link>

          <Link to="/verify/documents" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-check text-orange-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verify Documents</h3>
              <p className="text-sm text-gray-600">Review submissions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;