import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, TrendingUp, Award, ArrowRight, Star } from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();

  const stats = [
    { icon: <BookOpen className="w-8 h-8" />, label: 'Active Scholarships', value: '50+' },
    { icon: <Users className="w-8 h-8" />, label: 'Students Helped', value: '10,000+' },
    { icon: <TrendingUp className="w-8 h-8" />, label: 'Success Rate', value: '85%' },
    { icon: <Award className="w-8 h-8" />, label: 'Amount Disbursed', value: '₹5+ Cr' },
  ];

  const features = [
    {
      title: 'Easy Application Process',
      description: 'Simple, streamlined application forms that save your time and effort.',
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: 'Real-time Status Tracking',
      description: 'Track your application status and get updates instantly.',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Personalized Recommendations',
      description: 'Get scholarship recommendations based on your profile and eligibility.',
      icon: <Star className="w-6 h-6" />,
    },
    {
      title: 'Expert Support',
      description: '24/7 support from our team of education financing experts.',
      icon: <Users className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Student reading in library"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-orange-600/10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Text */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Gateway to
                <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent block">
                  Educational Excellence
                </span>
              </h1>

              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0">
                Discover, apply, and secure scholarships that match your dreams.
                FinSaarthi connects deserving students with life-changing educational opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <a
                    href="/dashboard"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group"
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/scholarships"
                      className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-orange-200 hover:border-orange-300 shadow-lg"
                    >
                      Browse Scholarships
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Right Hero Card */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                  alt="Student studying"
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success Story</h3>
                <p className="text-gray-600">
                  "FinSaarthi helped me secure a scholarship worth ₹2 lakhs for my engineering degree.
                  The process was seamless and the support was incredible!"
                </p>

                <div className="flex items-center mt-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Priya Sharma</p>
                    <p className="text-sm text-gray-600">Computer Engineering Student</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FinSaarthi?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built a comprehensive platform that makes finding and applying for scholarships easier than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center px-4">

          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>

          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already found their perfect scholarship match through FinSaarthi.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Create Account
              </a>

              <a
                href="/login"
                className="bg-orange-800 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-900 transition-all duration-300 shadow-lg"
              >
                Login
              </a>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};
