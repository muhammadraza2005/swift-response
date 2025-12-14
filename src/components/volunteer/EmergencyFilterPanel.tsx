interface FilterState {
  emergencyType: string;
  urgencyLevel: string;
  location: string;
}

interface EmergencyFilterPanelProps {
  filters: FilterState;
  onFilterChange: (field: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}

export default function EmergencyFilterPanel({ filters, onFilterChange, onClearFilters }: EmergencyFilterPanelProps) {
  const emergencyTypes = ['All', 'Medical', 'Fire', 'Flood', 'Earthquake', 'Accident', 'Other'];
  const urgencyLevels = ['All', 'High', 'Medium', 'Low'];

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
      </div>

      {/* Active Filters Summary */}
      {(filters.emergencyType !== 'All' || filters.urgencyLevel !== 'All' || filters.location) && (
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
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Location: {filters.location}
                <button
                  onClick={() => onFilterChange('location', '')}
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
