'use client';

import { useState } from 'react';

export interface FilterState {
  emergencyType: string;
  urgencyLevel: string;
  location: string;
  advancedFilter: string;
}

interface EmergencyFilterPanelProps {
  filters: FilterState;
  onFilterChange: (field: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}

export default function EmergencyFilterPanel({ filters, onFilterChange, onClearFilters }: EmergencyFilterPanelProps) {
  const emergencyTypes = ['All', 'Medical', 'Fire', 'Flood', 'Earthquake', 'Accident', 'Other'];
  const urgencyLevels = ['All', 'High', 'Medium', 'Low'];
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const handleAdvancedFilterChange = (value: string) => {
    setFilterError(null);
    onFilterChange('advancedFilter', value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Filter Emergencies</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-[#008C5A] font-semibold transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-5">
        {/* Emergency Type Filter */}
        <div>
          <label htmlFor="emergency-type" className="block text-sm font-semibold text-gray-700 mb-2">
            Emergency Type
          </label>
          <select
            id="emergency-type"
            value={filters.emergencyType}
            onChange={(e) => onFilterChange('emergencyType', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all bg-white text-gray-700"
          >
            {emergencyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Level Filter */}
        <div>
          <label htmlFor="urgency-level" className="block text-sm font-semibold text-gray-700 mb-2">
            Urgency Level
          </label>
          <select
            id="urgency-level"
            value={filters.urgencyLevel}
            onChange={(e) => onFilterChange('urgencyLevel', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all bg-white text-gray-700"
          >
            {urgencyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            placeholder="Search by location..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all"
          />
        </div>

        {/* Advanced Filter Toggle */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-[#008C5A] hover:text-[#006B44] transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Filter (DSL)
          </button>
          
          {showAdvanced && (
            <div className="mt-3">
              <label htmlFor="advanced-filter" className="block text-xs font-semibold text-gray-600 mb-2">
                Filter Expression
              </label>
              <textarea
                id="advanced-filter"
                value={filters.advancedFilter}
                onChange={(e) => handleAdvancedFilterChange(e.target.value)}
                placeholder='e.g., type == "Medical" && status == "pending"'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C5A] focus:border-transparent transition-all font-mono text-xs resize-none"
                rows={3}
              />
              {filterError && (
                <p className="mt-1 text-xs text-red-600">{filterError}</p>
              )}
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  View Examples
                </summary>
                <div className="mt-2 space-y-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div><code className="text-[#008C5A]">type == &quot;Medical&quot;</code> - Medical emergencies</div>
                  <div><code className="text-[#008C5A]">status == &quot;pending&quot; && !hasVolunteer</code> - Unassigned</div>
                  <div><code className="text-[#008C5A]">ageMinutes(createdAt) &lt; 30</code> - Recent (under 30 min)</div>
                  <div><code className="text-[#008C5A]">contains(description, &quot;urgent&quot;)</code> - Contains word</div>
                  <div><code className="text-[#008C5A]">distance(lat, lon, userLat, userLon) &lt; 5</code> - Within 5km</div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.emergencyType !== 'All' || filters.urgencyLevel !== 'All' || filters.location || filters.advancedFilter) && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">ACTIVE FILTERS</p>
          <div className="flex flex-wrap gap-2">
            {filters.emergencyType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                Type: {filters.emergencyType}
                <button
                  onClick={() => onFilterChange('emergencyType', 'All')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.urgencyLevel !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                Urgency: {filters.urgencyLevel}
                <button
                  onClick={() => onFilterChange('urgencyLevel', 'All')}
                  className="hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                Location: {filters.location}
                <button
                  onClick={() => onFilterChange('location', '')}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.advancedFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Advanced DSL
                <button
                  onClick={() => onFilterChange('advancedFilter', '')}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
