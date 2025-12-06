'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_MESSAGE_LENGTH = 500;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    // Basic Validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
        <p className="mb-8 text-medium text-lg">Have questions or suggestions? Reach out to our team.</p>
        
        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
            <p>Thank you for contacting us. We will get back to you shortly.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-green-700 font-semibold hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-secondary p-8 rounded-xl shadow-sm border border-gray-200">
            {status === 'error' && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Your Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                rows={5}
                placeholder="How can we help you?"
                required
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.message.length} / {MAX_MESSAGE_LENGTH} characters
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
