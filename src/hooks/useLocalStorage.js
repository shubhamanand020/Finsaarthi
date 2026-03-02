import { useState, useEffect } from 'react';

const STORAGE_KEY = 'finSaarthiData';

// Initial data (same structure, but without TypeScript types)
const initialData = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@finsaarthi.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User',
      createdAt: new Date().toISOString(),
      photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      phone: '+91 98765 43210',
      address: 'New Delhi, India',
      education: 'MBA in Finance',
    },
    {
      id: 'student-1',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
      name: 'Rahul Kumar',
      createdAt: new Date().toISOString(),
      photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      phone: '+91 87654 32109',
      address: 'Mumbai, Maharashtra, India',
      education: 'B.Tech Computer Science, IIT Mumbai',
      dateOfBirth: '2000-05-15',
      resume: 'https://example.com/resume/rahul-kumar.pdf',
    }
  ],
  scholarships: [
    {
      id: 'sch-1',
      title: 'Merit-Based Excellence Scholarship',
      amount: 50000,
      eligibility: ['Minimum 85% marks', 'Indian citizen', 'Age below 25'],
      deadline: '2026-12-31',
      description: 'This scholarship is awarded to students who have demonstrated exceptional academic performance and leadership qualities.',
      requirements: ['Academic transcripts', 'Income certificate', 'Recommendation letter'],
      provider: 'FinSaarthi Foundation',
      category: 'Merit-based',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'sch-2',
      title: 'Need-Based Financial Aid',
      amount: 30000,
      eligibility: ['Family income below ₹3,00,000', 'Indian citizen', 'Enrolled in recognized institution'],
      deadline: '2026-11-30',
      description: 'Financial assistance for students from economically disadvantaged backgrounds to pursue higher education.',
      requirements: ['Income certificate', 'Bank statements', 'Educational documents'],
      provider: 'Government of India',
      category: 'Need-based',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'sch-3',
      title: 'STEM Innovation Scholarship',
      amount: 75000,
      eligibility: ['STEM field student', 'Minimum 80% marks', 'Research project submission'],
      deadline: '2026-10-15',
      description: 'Supporting innovative students in Science, Technology, Engineering, and Mathematics fields.',
      requirements: ['Research proposal', 'Academic records', 'Project portfolio'],
      provider: 'Tech Innovation Council',
      category: 'Field-specific',
      createdAt: new Date().toISOString(),
      isActive: true,
    }
  ],
  applications: []
};

export const useLocalStorage = () => {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialData;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return initialData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [data]);

  // USER OPERATIONS
  const addUser = (user) => {
    const newUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    return newUser;
  };

  const getUserByCredentials = (email, password) => {
    return data.users.find(user => user.email === email && user.password === password);
  };

  const getUserById = (id) => {
    return data.users.find(user => user.id === id);
  };

  const updateUser = (id, updates) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === id ? { ...user, ...updates } : user
      )
    }));
  };

  // SCHOLARSHIPS
  const addScholarship = (sch) => {
    const newScholarship = {
      ...sch,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      scholarships: [...prev.scholarships, newScholarship]
    }));

    return newScholarship;
  };

  const updateScholarship = (id, updates) => {
    setData(prev => ({
      ...prev,
      scholarships: prev.scholarships.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    }));
  };

  const deleteScholarship = (id) => {
    setData(prev => ({
      ...prev,
      scholarships: prev.scholarships.filter(s => s.id !== id),
      applications: prev.applications.filter(app => app.scholarshipId !== id)
    }));
  };

  const getActiveScholarships = () => {
    return data.scholarships.filter(s => s.isActive);
  };

  const getScholarshipById = (id) => {
    return data.scholarships.find(s => s.id === id);
  };

  // APPLICATION OPERATIONS
  const addApplication = (app) => {
    const newApplication = {
      ...app,
      id: `app-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      applications: [...prev.applications, newApplication]
    }));

    return newApplication;
  };

  const updateApplicationStatus = (id, status, adminNotes) => {
    setData(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.id === id ? { ...a, status, adminNotes } : a
      )
    }));
  };

  const getApplicationsByStudent = (studentId) => {
    return data.applications.filter(app => app.studentId === studentId);
  };

  const getApplicationById = (id) => {
    return data.applications.find(app => app.id === id);
  };

  const hasUserApplied = (studentId, scholarshipId) => {
    return data.applications.some(app =>
      app.studentId === studentId && app.scholarshipId === scholarshipId
    );
  };

  return {
    data,

    // user operations
    addUser,
    getUserByCredentials,
    getUserById,
    updateUser,

    // scholarship operations
    addScholarship,
    updateScholarship,
    deleteScholarship,
    getActiveScholarships,
    getScholarshipById,

    // application operations
    addApplication,
    updateApplicationStatus,
    getApplicationsByStudent,
    getApplicationById,
    hasUserApplied,
  };
};
