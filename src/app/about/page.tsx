'use client';

import { useState } from 'react';
import {
  Shield,
  Users,
  Zap,
  Rocket,
  MapPin,
  Send
} from 'lucide-react';

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-[#008C5A] py-24 px-4 overflow-hidden">
        {/* Decorative Elements - Subtle Patterns instead of blobs */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up tracking-tight">About Swift Response</h1>
          <div className="w-20 h-1 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Mission Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#008C5A] rounded-full"></span>
            Our Mission
          </h2>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <p className="text-gray-600 leading-relaxed text-lg sm:text-xl">
              Swift Response is dedicated to enhancing community safety and resilience through rapid, coordinated emergency
              response. Our platform empowers individuals to report incidents swiftly, access vital resources, and collaborate effectively
              during crises. We strive to build a network where every member can contribute to a safer environment for all.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#008C5A] rounded-full"></span>
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Safety First',
                description: 'Prioritizing the safety and well-being of individuals and communities.',
                color: 'text-blue-600',
                bg: 'bg-blue-50'
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Fostering a collaborative spirit where every member can contribute.',
                color: 'text-purple-600',
                bg: 'bg-purple-50'
              },
              {
                icon: Zap,
                title: 'Rapid Action',
                description: 'Ensuring swift and effective responses to emergencies.',
                color: 'text-orange-600',
                bg: 'bg-orange-50'
              }
            ].map((value, index) => (
              <div
                key={value.title}
                className="group bg-white border border-gray-100 rounded-2xl p-8 hover:border-[#008C5A] hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 ${value.bg} ${value.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#008C5A] transition-colors">{value.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#008C5A] rounded-full"></span>
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Nosherwan Tahir', role: 'Team Lead', initials: 'NT' },
              { name: 'Muhammad Raza Khan', role: 'Full Stack Developer', initials: 'MR' },
              { name: 'Muhammad Sohaib Akhtar', role: 'UI/UX Designer', initials: 'MS' }
            ].map((member, index) => (
              <div
                key={member.name}
                className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover:shadow-lg transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#008C5A] transition-colors duration-300">
                  <span className="text-2xl font-bold text-gray-600 group-hover:text-white transition-colors">{member.initials}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{member.name}</h3>
                <p className="text-[#008C5A] text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#008C5A] rounded-full"></span>
            Our Journey
          </h2>
          <div className="space-y-8 relative pl-8 border-l-2 border-gray-100 ml-4">
            {[
              {
                icon: Rocket,
                year: '2025',
                title: 'Platform Idea',
                description: 'Swift Response was envisioned to transform community emergency response.'
              },
              {
                icon: MapPin,
                year: '2026',
                title: 'Platform Launch',
                description: 'Swift Response will be launched with a vision to transform community emergency response.'
              },
              {
                icon: Users,
                year: '2027',
                title: '100,000+ Users',
                description: 'We will reach a milestone of over 100,000 users, reflecting our growing impact.'
              }
            ].map((milestone, index) => (
              <div
                key={milestone.year}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white border-4 border-[#008C5A] z-10"></div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#008C5A] font-bold text-lg">{milestone.year}</span>
                    <span className="w-1 h-4 bg-gray-200"></span>
                    <h3 className="font-bold text-gray-900 text-lg">{milestone.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#008C5A] rounded-full"></span>
            Contact Us
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                required
                rows={6}
                placeholder="Enter your message"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#008C5A] hover:bg-[#007a4e] text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
              {!status && <Send className="w-4 h-4" />}
            </button>

            {status === 'success' && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <p className="font-medium">Message sent successfully! We'll get back to you soon.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <p className="font-medium">Failed to send message. Please try again.</p>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

