# Little Language DSL - Quick Start Guide

## 🚀 Testing the Feature

### 1. Start the Application
```bash
npm run dev
# Navigate to http://localhost:3000/volunteer
```

### 2. Access Advanced Filter
- Login as a volunteer
- Look for "Filter Emergencies" panel on the left
- Click "Advanced Filter (DSL)" to expand the expression editor

### 3. Try These Expressions

#### Basic Filters
```javascript
// Show only Medical emergencies
type == "Medical"

// Show only pending requests
status == "pending"

// Show requests without volunteers
!hasVolunteer

// Combine multiple conditions
type == "Fire" && status == "pending"
```

#### Time-Based Filters
```javascript
// Emergencies created in last 30 minutes
ageMinutes(createdAt) < 30

// Emergencies older than 1 hour
ageHours(createdAt) > 1

// Recent urgent emergencies
type == "Medical" && ageMinutes(createdAt) < 15
```

#### Location-Based Filters (requires location permission)
```javascript
// Within 5km of your location
distance(lat, lon, userLat, userLon) < 5

// Between 2-10km away
distance(lat, lon, userLat, userLon) > 2 && distance(lat, lon, userLat, userLon) < 10

// Nearby medical emergencies
type == "Medical" && distance(lat, lon, userLat, userLon) < 10
```

#### Text Search
```javascript
// Search in description
contains(description, "urgent")

// Search in address
contains(address, "hospital")

// Search in either
contains(description, "child") || contains(address, "school")
```

#### Complex Expressions
```javascript
// High priority: Medical/Fire without volunteers in last hour
(type == "Medical" || type == "Fire") && !hasVolunteer && ageHours(createdAt) < 1

// Nearby unassigned emergencies
!hasVolunteer && distance(lat, lon, userLat, userLon) < 10

// Conditional distance based on type
type == "Medical" ? distance(lat, lon, userLat, userLon) < 5 : distance(lat, lon, userLat, userLon) < 15
```

## 📚 Available Variables

### Request Data
- `type` - "Medical" | "Fire" | "Flood" | "Earthquake" | "Accident" | "Other"
- `status` - "pending" | "assigned" | "resolved"  
- `description` - Full text description
- `address` - Location address string
- `lat`, `lon` - Coordinates (numbers)
- `createdAt` - ISO timestamp string

### Computed Flags
- `hasVolunteer` - Boolean, true if assigned
- `isPending` - Boolean, true if status is pending
- `isAssigned` - Boolean, true if status is assigned
- `isResolved` - Boolean, true if status is resolved

### User Context (when location enabled)
- `userLat`, `userLon` - Your current coordinates

## 🔧 Available Functions

### Distance
- `distance(lat1, lon1, lat2, lon2)` - Returns km between points

### String
- `contains(str, search)` - Case-insensitive substring match
- `startsWith(str, prefix)` - Case-insensitive prefix match

### Math
- `abs(value)` - Absolute value
- `min(a, b, ...)` - Minimum value
- `max(a, b, ...)` - Maximum value

### Time
- `ageMinutes(timestamp)` - Minutes since creation
- `ageHours(timestamp)` - Hours since creation

## 🎯 Operators

### Comparison
- `==`, `!=` - Equality
- `<`, `>`, `<=`, `>=` - Numeric comparison

### Logical
- `&&` - AND
- `||` - OR
- `!` - NOT

### Arithmetic
- `+`, `-`, `*`, `/`, `%`

### Ternary
- `condition ? valueIfTrue : valueIfFalse`

## 💡 Pro Tips

1. **Start Simple**: Begin with basic expressions like `type == "Medical"` 
2. **Combine Gradually**: Add more conditions with `&&` or `||`
3. **Test as You Go**: The filter applies in real-time
4. **Check Examples**: Click "View Examples" for quick reference
5. **Location Permission**: Allow location access for distance filters

## 🔍 Troubleshooting

### Filter Not Working?
- Check syntax (e.g., strings need quotes: `"Medical"`)
- Verify variable names (use `type` not `requestType`)
- Check operators (use `==` not `=`)

### No Results?
- Try simpler expression first
- Verify data exists matching your criteria
- Check if basic filters are also active

### Location Functions Not Working?
- Enable location permission when prompted
- Check that `userLat` and `userLon` are available
- Verify emergency requests have location data

## 📖 Implementation Files

### Core DSL
- `src/utils/dsl/ast.ts` - AST node definitions
- `src/utils/dsl/parser.ts` - String to AST parser
- `src/utils/dsl/evaluator.ts` - AST evaluator (visitor)
- `src/utils/dsl/emergencyFilter.ts` - Domain integration

### UI Integration
- `src/components/volunteer/EmergencyFilterPanel.tsx` - Filter UI
- `src/app/volunteer/page.tsx` - Volunteer dashboard

### Documentation
- `LITTLE_LANGUAGE_DSL.md` - Complete documentation

## 🎓 Learning More

The implementation demonstrates three key concepts:

1. **AST Structures** - Code represented as tree data structures
2. **Parser** - Converting text into structured AST nodes
3. **Visitor Pattern** - Operations performed on AST by visitors

See `LITTLE_LANGUAGE_DSL.md` for comprehensive documentation including design patterns, type safety, and future enhancements.
