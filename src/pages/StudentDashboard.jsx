import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScholarshipCard } from '../component/ScholarshipCard';
import {
  Search,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const {
    getActiveScholarships,
    getApplicationsByStudent,
    hasUserApplied,
    addApplication,
    getScholarshipById
  } = useLocalStorage();

  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  // Application Modal State
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  // NEW: View Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const [applicationForm, setApplicationForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    education: '',
    gpa: 0,
    documents: [],
  });

  if (!user) {
    return <div>Please log in to access your dashboard.</div>;
  }

  const scholarships = getActiveScholarships();
  const applications = getApplicationsByStudent(user.id);

  const filteredScholarships = useMemo(() => {
    let filtered = scholarships.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === '' || s.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [scholarships, searchTerm, selectedCategory, sortBy]);

  const categories = [...new Set(scholarships.map((s) => s.category))];

  // Handler for Apply
  const handleApply = (scholarshipId) => {
    setSelectedScholarship(scholarshipId);
    setShowApplicationModal(true);
    // If opening apply from details modal, close details modal
    if (showDetailsModal) setShowDetailsModal(false);
  };

  // NEW: Handler for View Details
  const handleViewDetails = (scholarshipId) => {
    const scholarship = getScholarshipById(scholarshipId);
    if (!scholarship) return;
    setDetailsData(scholarship);
    setShowDetailsModal(true);
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();

    if (!user || !selectedScholarship) return;

    addApplication({
      studentId: user.id,
      scholarshipId: selectedScholarship,
      status: 'pending',
      studentDetails: applicationForm,
    });

    setShowApplicationModal(false);
    setSelectedScholarship(null);

    setApplicationForm({
      name: user.name,
      email: user.email,
      phone: '',
      address: '',
      education: '',
      gpa: 0,
      documents: [],
    });
    
    alert("Application submitted successfully!");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'under-review':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Track your applications and discover new scholarship opportunities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{scholarships.length}</p>
                <p className="text-gray-600">Available Scholarships</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-gray-600">Your Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((app) => app.status === 'approved').length}
                </p>
                <p className="text-gray-600">Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Browse Scholarships
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                My Applications ({applications.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* TAB: BROWSE */}
            {activeTab === 'browse' ? (
              <div>
                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search scholarships..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="deadline">Sort by Deadline</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>

                {/* Scholarships Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScholarships.map((sch) => (
                    <ScholarshipCard
                      key={sch.id}
                      scholarship={sch}
                      onApply={() => handleApply(sch.id)}
                      onView={() => handleViewDetails(sch.id)} // <--- NEW PROP
                      hasApplied={hasUserApplied(user.id, sch.id)}
                    />
                  ))}
                </div>

                {filteredScholarships.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No scholarships found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* TAB: APPLICATIONS */
              <div>
                {applications.length > 0 ? (
                  <div className="space-y-6">
                    {applications.map((app) => {
                      const scholarship = getScholarshipById(app.scholarshipId);
                      if (!scholarship) return null;

                      return (
                        <div
                          key={app.id}
                          className="bg-gray-50 border rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">{scholarship.title}</h3>
                              <p className="text-gray-600 text-sm">
                                Applied on:{' '}
                                {new Date(app.submittedAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {getStatusIcon(app.status)}
                              <span
                                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                              >
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Amount:</span>
                              <span className="ml-2 text-orange-600 font-semibold">
                                ₹{scholarship.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Provider:</span>
                              <span className="ml-2 text-gray-600">
                                {scholarship.provider}
                              </span>
                            </div>
                          </div>

                          {app.adminNotes && (
                            <div className="mt-4 bg-white border rounded p-3">
                              <h4 className="font-medium mb-1">Admin Notes:</h4>
                              <p className="text-gray-600 text-sm">{app.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start browsing scholarships and apply to ones that match your profile.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg"
                    >
                      Browse Scholarships
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL (NEW) */}
      {showDetailsModal && detailsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setShowDetailsModal(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2">{detailsData.title}</h2>

            <p className="text-gray-600 mb-4">
              Provider: <span className="font-medium">{detailsData.provider}</span>
            </p>

            <p className="text-orange-600 text-xl font-semibold mb-4">
              ₹{detailsData.amount.toLocaleString("en-IN")}
            </p>

            <p className="text-gray-700 mb-4">
              Deadline:{" "}
              <span className="font-medium">
                {new Date(detailsData.deadline).toLocaleDateString("en-IN")}
              </span>
            </p>

            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 mb-4">{detailsData.description}</p>

            <h3 className="font-semibold text-lg mb-2">Eligibility</h3>
            <ul className="list-disc ml-5 mb-4 text-gray-700">
              {detailsData.eligibility.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>

            <h3 className="font-semibold text-lg mb-2">Required Documents</h3>
            <ul className="list-disc ml-5 mb-4 text-gray-700">
              {detailsData.requirements.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>

            <p className="text-gray-700 mb-4">
              Category:{" "}
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {detailsData.category}
              </span>
            </p>

            <div className="flex space-x-4">
               <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
               >
                  Close
               </button>
               
               {/* Conditional Apply Button inside Modal */}
               {!hasUserApplied(user.id, detailsData.id) && (
                 <button
                   onClick={() => handleApply(detailsData.id)}
                   className="flex-1 px-5 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                 >
                   Apply Now
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION FORM MODAL */}
      {showApplicationModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Apply for Scholarship</h2>

              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicationForm.name}
                      onChange={(e) =>
                        setApplicationForm({ ...applicationForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={applicationForm.email}
                      onChange={(e) =>
                        setApplicationForm({ ...applicationForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={applicationForm.phone}
                      onChange={(e) =>
                        setApplicationForm({ ...applicationForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GPA / Percentage</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={applicationForm.gpa}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          gpa: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    required
                    rows={3}
                    value={applicationForm.address}
                    onChange={(e) =>
                      setApplicationForm({ ...applicationForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Educational Background
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={applicationForm.education}
                    onChange={(e) =>
                      setApplicationForm({ ...applicationForm, education: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};