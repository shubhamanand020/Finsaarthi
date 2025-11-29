import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  User,
  Camera,
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Calendar,
  Phone,
  MapPin,
  GraduationCap
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const { getUserById, updateUser } = useLocalStorage();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState(null);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    dateOfBirth: '',
    photo: '',
    resume: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const currentUser = user ? getUserById(user.id) : null;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        education: currentUser.education || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        photo: currentUser.photo || '',
        resume: currentUser.resume || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
      return false;
    }

    if (formData.photo && !isValidUrl(formData.photo)) {
      setMessage({ type: 'error', text: 'Please enter a valid photo URL.' });
      return false;
    }

    if (formData.resume && !isValidUrl(formData.resume)) {
      setMessage({ type: 'error', text: 'Please enter a valid resume URL.' });
      return false;
    }

    if (showPasswordChange) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required.' });
        return false;
      }

      if (currentUser && formData.currentPassword !== currentUser.password) {
        setMessage({ type: 'error', text: 'Current password is incorrect.' });
        return false;
      }

      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm() || !user || !currentUser) return;

    setIsLoading(true);

    try {
      const updates = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        education: formData.education.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        photo: formData.photo.trim() || undefined,
        resume: formData.resume.trim() || undefined,
      };

      if (showPasswordChange && formData.newPassword) {
        updates.password = formData.newPassword;
      }

      updateUser(user.id, updates);

      if (formData.name !== user.name || formData.email !== user.email) {
        login({
          ...user,
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
        });
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setIsEditing(false);
      setShowPasswordChange(false);

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred while updating your profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        education: currentUser.education || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        photo: currentUser.photo || '',
        resume: currentUser.resume || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }

    setIsEditing(false);
    setShowPasswordChange(false);
    setMessage(null);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!user || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>

        {/* Success / Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}

            <span
              className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}
            >
              {message.text}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT CARD */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border">

              <div className="text-center">
                <div className="relative inline-block">

                  {currentUser.photo ? (
                    <img
                      src={currentUser.photo}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center border-4 border-orange-200">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-bold">{currentUser.name}</h2>
                <p className="text-gray-600">{currentUser.email}</p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </span>

                {/* Member Since */}
                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="font-semibold">
                    {new Date(currentUser.createdAt).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border">

              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">

                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>

                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dateOfBirth"
                      disabled={!isEditing}
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* ADDRESS */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address
                    </label>

                    <textarea
                      name="address"
                      rows={3}
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* EDUCATION */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      Education
                    </label>

                    <textarea
                      name="education"
                      rows={3}
                      disabled={!isEditing}
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* PHOTO URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Camera className="w-4 h-4 inline mr-1" />
                      Photo URL
                    </label>
                    <input
                      type="url"
                      name="photo"
                      disabled={!isEditing}
                      value={formData.photo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                  {/* RESUME URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Resume URL
                    </label>
                    <input
                      type="url"
                      name="resume"
                      disabled={!isEditing}
                      value={formData.resume}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>

                </div>

                {/* CHANGE PASSWORD SECTION */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t">

                    <div className="flex justify-between">
                      <h4 className="text-lg font-medium">Change Password</h4>

                      <button
                        type="button"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="text-orange-600 hover:text-orange-700 text-sm"
                      >
                        {showPasswordChange ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordChange && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                        {/* CURRENT PASSWORD */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Password *</label>

                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              name="currentPassword"
                              required
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border rounded-lg"
                            />

                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </div>

                        {/* NEW PASSWORD */}
                        <div>
                          <label className="block text-sm font-medium mb-2">New Password *</label>

                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              name="newPassword"
                              required
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border rounded-lg"
                            />

                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Confirm New Password *</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>

                      </div>
                    )}
                  </div>
                )}

              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
