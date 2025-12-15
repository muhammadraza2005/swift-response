'use client';

import { useState } from 'react';
import { InputValidator, PhoneParser } from '@/utils/validation/inputGrammar';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate using grammar-based validator
    const validation = InputValidator.validateContactForm(formData);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setStatus('error');
      return;
    }
    
    setValidationErrors({});
    setStatus('submitting');

    try {
      // Format phone if provided
      let formattedData = { ...formData };
      if (formData.phone) {
        const parsed = PhoneParser.parse(formData.phone);
        if (parsed) {
          formattedData.phone = PhoneParser.format(parsed);
        }
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all ${
              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(123) 456-7890"
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Format: (123) 456-7890 or 123-456-7890</p>
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all resize-none ${
              validationErrors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell us how we can help..."
          />
          {validationErrors.message && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
          )}
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