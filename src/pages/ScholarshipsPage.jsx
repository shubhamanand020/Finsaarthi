import React, { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ScholarshipCard } from "../component/ScholarshipCard";
import { Search, BookOpen } from "lucide-react";

export const ScholarshipsPage = () => {
  const { user } = useAuth();
  const {
    getActiveScholarships,
    hasUserApplied,
    addApplication,
    getScholarshipById,
  } = useLocalStorage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("deadline");

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const [applicationForm, setApplicationForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    education: "",
    gpa: 0,
    documents: [],
  });

  // 👉 NEW States for View Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const scholarships = getActiveScholarships();

  const filteredScholarships = useMemo(() => {
    let filtered = scholarships.filter((sch) => {
      const matchesSearch =
        sch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.provider.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "" || sch.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "deadline":
          return new Date(a.deadline) - new Date(b.deadline);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [scholarships, searchTerm, selectedCategory, sortBy]);

  const categories = [...new Set(scholarships.map((s) => s.category))];

  // 👉 VIEW DETAILS HANDLER (Modal)
  const handleViewDetails = (scholarshipId) => {
    const scholarship = getScholarshipById(scholarshipId);
    if (!scholarship) return;

    setDetailsData(scholarship);
    setShowDetailsModal(true);
  };

  // APPLY FLOW
  const handleApply = (scholarshipId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setSelectedScholarship(scholarshipId);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!user || !selectedScholarship) return;

    addApplication({
      studentId: user.id,
      scholarshipId: selectedScholarship,
      status: "pending",
      studentDetails: applicationForm,
    });

    setShowApplicationModal(false);
    setSelectedScholarship(null);

    setApplicationForm({
      name: user.name,
      email: user.email,
      phone: "",
      address: "",
      education: "",
      gpa: 0,
      documents: [],
    });

    alert("Application submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Available Scholarships</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover scholarship opportunities that match your profile and educational goals.
            Apply now to secure funding for your academic journey.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="amount">Sort by Amount</option>
              <option value="title">Sort by Title</option>
            </select>

          </div>
        </div>

        {/* Count */}
        <div className="flex justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
          </p>

          {!user && (
            <p className="text-sm text-gray-600">
              <a href="/login" className="text-orange-600 font-medium hover:text-orange-700">
                Login to apply
              </a>
            </p>
          )}
        </div>

        {/* Scholarships Grid */}
        {filteredScholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredScholarships.map((sch) => (
              <ScholarshipCard
                key={sch.id}
                scholarship={sch}
                onApply={user ? () => handleApply(sch.id) : undefined}
                onView={() => handleViewDetails(sch.id)}
                hasApplied={user ? hasUserApplied(user.id, sch.id) : false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold">No scholarships found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* ⭐ VIEW DETAILS MODAL */}
      {showDetailsModal && detailsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl p-6 relative">

            {/* Close */}
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

            {user && user.role === "student" && (
              <button
                onClick={() => handleApply(detailsData.id)}
                className="w-full mt-4 px-5 py-3 bg-orange-600 text-white text-lg rounded-lg hover:bg-orange-700 transition"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
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
                    <label className="block text-sm font-medium mb-2">Phone</label>
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
                    <label className="block text-sm font-medium mb-2">GPA</label>
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
                  <label className="block text-sm font-medium mb-2">Education</label>
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
