import React from 'react';
import { Calendar, IndianRupee, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScholarshipCard = ({
  scholarship,
  onApply,
  onView,
  showActions = true,
  hasApplied = false,
}) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isDeadlineNear = () => {
    const deadline = new Date(scholarship.deadline);
    const today = new Date();
    const daysLeft = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 7 && daysLeft > 0;
  };

  const isExpired = () => {
    const deadline = new Date(scholarship.deadline);
    const today = new Date();
    return deadline < today;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {scholarship.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="w-4 h-4 mr-2" />
              <span className="text-sm">{scholarship.provider}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                scholarship.category === 'Merit-based'
                  ? 'bg-blue-100 text-blue-800'
                  : scholarship.category === 'Need-based'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {scholarship.category}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center mb-4">
          <IndianRupee className="w-5 h-5 text-orange-600 mr-2" />
          <span className="text-2xl font-bold text-orange-600">
            {formatAmount(scholarship.amount)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {scholarship.description}
        </p>

        {/* Eligibility */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Key Eligibility:
          </h4>
          <div className="flex flex-wrap gap-2">
            {scholarship.eligibility.slice(0, 2).map((criteria, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs"
              >
                {criteria}
              </span>
            ))}
            {scholarship.eligibility.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{scholarship.eligibility.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center mb-6">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <span
            className={`text-sm ${
              isExpired()
                ? 'text-red-600'
                : isDeadlineNear()
                ? 'text-orange-600'
                : 'text-gray-600'
            }`}
          >
            Deadline: {new Date(scholarship.deadline).toLocaleDateString('en-IN')}
            {isExpired() && ' (Expired)'}
            {isDeadlineNear() && !isExpired() && ' (Closing Soon!)'}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3">
            <button
              onClick={onView}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              View Details
            </button>

            {onApply && !isExpired() && (
              <button
                onClick={onApply}
                disabled={hasApplied}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  hasApplied
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                }`}
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </button>
            )}
          </div>
        )}

        {isExpired() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">
              This scholarship application deadline has passed.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
