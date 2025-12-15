'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/maps/LocationPicker';
import { Info, Check, Stethoscope, Flame, Waves, LifeBuoy, Home, Siren, Package, TriangleAlert, MapPin, Camera, AlertTriangle, Loader2 } from 'lucide-react';
import Loader from '@/components/Loader';

export default function RequestHelpPage() {
  const [formData, setFormData] = useState({
    type: 'Medical',
    description: '',
    location: '',
    coordinates: { lat: 31.5204, lng: 74.3587 }, // Default to Lahore
    urgency: 'High',
    images: null as File[] | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?message=Please log in to request help');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files!)
      }));
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: address,
      coordinates: { lat, lng }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const location = {
      lat: formData.coordinates.lat,
      lng: formData.coordinates.lng,
      address: formData.location
    };

    // Note: urgency is used for UI but not stored in DB currently as per schema
    const { error } = await supabase.from('emergency_requests').insert({
      requester_id: user.id,
      type: formData.type,
      description: `${formData.urgency} Urgency: ${formData.description}`, // Prepend urgency to description since column doesn't exist
      location,
      status: 'pending'
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert('Emergency reported successfully! Help is on the way.');
      router.push('/dashboard');
    }
  };

  if (!user) return <Loader text="Loading..." />;

  return (
    <div className="bg-white relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-[#DC3545] to-[#C82333] text-white overflow-hidden">
        <div className="absolute top-10 right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">Report Emergency</h1>
          <p className="text-lg opacity-95 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Get immediate help by reporting your emergency
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Instructions */}
        <div className="glass p-8 rounded-2xl mb-8">
          <h3 className="text-2xl font-bold text-[#333333] mb-4 flex items-center">
            <Info className="w-8 h-8 mr-3 text-blue-500" />
            How to Report Correctly
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center">
              <Check className="w-5 h-5 text-[#008C5A] mr-3" />
              <span>Select the correct category for your emergency</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-[#008C5A] mr-3" />
              <span>Provide a precise location or description of surroundings</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-[#008C5A] mr-3" />
              <span>Keep the description clear and concise</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-[#008C5A] mr-3" />
              <span>Upload photos if safe to do so (Optional)</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emergency Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-bold text-gray-700 mb-2">
              Emergency Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC3545] focus:border-transparent transition-all"
            >
              <option value="Medical">Medical Help</option>
              <option value="Fire">Fire</option>
              <option value="Flood">Flood</option>
              {/* Mapped extra types to 'Other' or nearest equivalent or just use 'Other' for now to match schema */}
              <option value="Rescue">Rescue</option>
              <option value="Other">Earthquake (Other)</option>
              <option value="Other">Accident (Other)</option>
              <option value="Other">Supplies Needed (Other)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Urgency Level */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-bold text-gray-700 mb-2">
              Urgency Level *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['High', 'Medium', 'Low'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${formData.urgency === level
                    ? level === 'High'
                      ? 'bg-red-500 text-white'
                      : level === 'Medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC3545] focus:border-transparent transition-all resize-none"
              placeholder="Describe the emergency situation in detail..."
            />
          </div>

          {/* Location - Map Picker */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Location *
            </label>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={formData.coordinates}
            />
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC3545] focus:border-transparent transition-all mt-3"
              placeholder="Address will appear here when you select on map..."
            />
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Click on the map above to select the emergency location, or use the current location button
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="images" className="block text-sm font-bold text-gray-700 mb-2">
              Upload Images (Optional)
            </label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC3545] focus:border-transparent transition-all"
            />
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <Camera className="w-4 h-4" /> Upload photos if it's safe to do so (Max 5 images)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#DC3545] to-[#C82333] text-white font-bold py-4 px-8 rounded-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-6 h-6" /> Submit Emergency Report
              </span>
            )}
          </button>
        </form>

        {/* Emergency Contact */}
        <div className="mt-8 glass p-6 rounded-2xl text-center">
          <p className="text-gray-700">
            <span className="font-bold text-red-600">Life-threatening emergency?</span>
            <br />
            Call emergency services immediately: <span className="font-bold text-2xl">1122</span>
          </p>
        </div>
      </div>
    </div>
  );
}
