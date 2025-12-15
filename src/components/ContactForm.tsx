'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    <div className="glass p-8 sm:p-12 rounded-3xl max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all resize-none"
            placeholder="Tell us how we can help..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-linear-to-r from-[#008C5A] to-[#00A366] text-white font-bold py-4 px-8 rounded-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>

        {status === 'success' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="text-green-700 font-semibold">Message sent successfully! We'll get back to you soon.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-red-700 font-semibold">Failed to send message. Please try again.</p>
          </div>
        )}
      </form>
    </div>
  );
}