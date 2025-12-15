# Little Language DSL Implementation

## Overview

This is a **production implementation** of the Little Languages concept integrated into the Emergency Response web application. The DSL powers an **Advanced Filter** feature that allows users to write custom expressions to filter emergency requests.

## 🎯 Real Application Feature

**Feature:** Advanced Emergency Request Filtering in Volunteer Dashboard  
**Location:** `/volunteer` page  
**User Story:** As a volunteer, I want to write custom filter expressions to find specific emergencies that match complex criteria (e.g., "Medical emergencies within 5km created in last 30 minutes that don't have volunteers yet").

## 🏗️ Architecture

### 1. **AST (Abstract Syntax Tree) Structures**
File: `src/utils/dsl/ast.ts`

Represents code as tree structures with 7 node types:

```typescript
// Node Types
- LiteralNode       // Values: numbers, strings, booleans
- VariableNode      // Variable references
- BinaryOpNode      // Binary operations: +, -, *, /, ==, !=, &&, ||, <, >, <=, >=
- UnaryOpNode       // Unary operations: -, !
- FunctionCallNode  // Function calls: distance(lat, lon, userLat, userLon)
- ConditionalNode   // Ternary: condition ? trueExpr : falseExpr
- MemberAccessNode  // Property access: object.property
```

**Key Design:**
- All nodes implement `ASTNode` interface with `accept<T>(visitor: ASTVisitor<T>): T`
- Type-safe visitor pattern implementation
- Immutable node structure (readonly properties)

### 2. **Parser (String to AST)**
File: `src/utils/dsl/parser.ts`

Converts string expressions into AST structures:

```
"type == 'Medical' && distance(lat, lon, userLat, userLon) < 5"
                    ↓
         BinaryOpNode('&&')
        /                   \
  BinaryOpNode('==')    BinaryOpNode('<')
    /          \          /              \
Variable    Literal   FunctionCall    Literal
 'type'    'Medical'  'distance'        5
```

**Components:**
- **Lexer:** Tokenizes input string
- **Parser:** Recursive descent parser with operator precedence
- **Error Handling:** Clear error messages with position information

### 3. **Visitor Pattern (Operations on AST)**
File: `src/utils/dsl/evaluator.ts`

The Evaluator visitor executes the AST:

```typescript
class Evaluator implements ASTVisitor<EvaluatorValue> {
  visitLiteral(node: LiteralNode): EvaluatorValue
  visitVariable(node: VariableNode): EvaluatorValue
  visitBinaryOp(node: BinaryOpNode): EvaluatorValue
  visitUnaryOp(node: UnaryOpNode): EvaluatorValue
  visitFunctionCall(node: FunctionCallNode): EvaluatorValue
  visitConditional(node: ConditionalNode): EvaluatorValue
  visitMemberAccess(node: MemberAccessNode): EvaluatorValue
}
```

### 4. **Domain Integration**
File: `src/utils/dsl/emergencyFilter.ts`

Integrates DSL with emergency request filtering:

```typescript
class EmergencyFilterDSL {
  // Parse expression to AST
  parse(expression: string): ASTNode
  
  // Evaluate against single request
  evaluate(expression: string, request: IEmergencyRequest, context: FilterContext): boolean
  
  // Filter array of requests
  filter(requests: IEmergencyRequest[], expression: string, context: FilterContext): IEmergencyRequest[]
  
  // Validate expression syntax
  validate(expression: string): { valid: boolean; error?: string }
}
```

## 📝 Type Safety Implementation

### No `any` Types Used
All types are properly defined:

```typescript
// Evaluator value types
type EvaluatorValue = string | number | boolean | Record<string, unknown> | null | undefined;

// Function signatures
type EvaluatorFunction = (...args: EvaluatorValue[]) => EvaluatorValue;

// Context types
type EvaluatorContext = Record<string, EvaluatorValue>;

// Filter context with user location
interface FilterContext {
  userLat?: number;
  userLon?: number;
}
```

### Type Guards
Proper type checking in operations:

```typescript
case '+':
  if (typeof left === 'number' && typeof right === 'number') {
    return left + right;
  }
  if (typeof left === 'string' || typeof right === 'string') {
    return String(left) + String(right);
  }
  throw new Error('Invalid operands for + operator');
```

## 🔧 Available Functions

The DSL provides built-in functions for emergency filtering:

### Distance Calculation
```typescript
distance(lat, lon, userLat, userLon)
// Returns distance in kilometers
// Example: distance(lat, lon, userLat, userLon) < 10
```

### String Operations
```typescript
contains(str, search)      // Case-insensitive substring search
startsWith(str, prefix)    // Case-insensitive prefix check
```

### Math Operations
```typescript
abs(value)           // Absolute value
min(a, b, ...)      // Minimum value
max(a, b, ...)      // Maximum value
```

### Time Operations
```typescript
ageMinutes(timestamp)  // Age in minutes since creation
ageHours(timestamp)    // Age in hours since creation
```

## 🎨 UI Integration

### Component: EmergencyFilterPanel
File: `src/components/volunteer/EmergencyFilterPanel.tsx`

Features:
- **Basic Filters:** Type, Urgency, Location (dropdowns/text input)
- **Advanced Filter:** Expandable DSL expression editor
- **Live Validation:** Parse errors shown immediately
- **Examples:** Built-in help with common expressions
- **Active Filter Tags:** Visual feedback for applied filters

### Page: Volunteer Dashboard
File: `src/app/volunteer/page.tsx`

Integration:
```typescript
// Apply advanced DSL filter if present
if (filters.advancedFilter && filters.advancedFilter.trim()) {
  const validation = emergencyFilterDSL.validate(filters.advancedFilter);
  if (validation.valid) {
    displayedRequests = emergencyFilterDSL.filter(
      displayedRequests,
      filters.advancedFilter,
      {
        userLat: userLocation?.lat,
        userLon: userLocation?.lng,
      }
    );
  }
}
```

## 📖 Usage Examples

### Basic Filtering
```javascript
// Medical emergencies only
type == "Medical"

// Pending requests without volunteers
status == "pending" && !hasVolunteer

// Recent emergencies (under 30 minutes)
ageMinutes(createdAt) < 30
```

### Distance-Based Filtering
```javascript
// Within 5km of user
distance(lat, lon, userLat, userLon) < 5

// Between 2km and 10km away
distance(lat, lon, userLat, userLon) > 2 && distance(lat, lon, userLat, userLon) < 10
```

### Complex Expressions
```javascript
// Medical emergencies within 10km that are pending
type == "Medical" && status == "pending" && distance(lat, lon, userLat, userLon) < 10

// Urgent requests: medical/fire, no volunteer, created in last hour
(type == "Medical" || type == "Fire") && !hasVolunteer && ageHours(createdAt) < 1

// Search by keyword in description or address
contains(description, "urgent") || contains(address, "hospital")
```

### Conditional Filtering
```javascript
// Different criteria based on request type
type == "Medical" ? distance(lat, lon, userLat, userLon) < 5 : distance(lat, lon, userLat, userLon) < 15
```

## 🧪 Testing the Feature

### Steps to Test:

1. **Navigate to Volunteer Page**
   ```
   http://localhost:3000/volunteer
   ```

2. **Open Advanced Filter**
   - Click "Advanced Filter (DSL)" button in the filter panel
   - Expandable section appears with textarea

3. **Try Basic Expression**
   ```
   type == "Medical"
   ```
   - Should filter to only Medical emergencies

4. **Try Complex Expression**
   ```
   status == "pending" && !hasVolunteer
   ```
   - Shows only unassigned pending requests

5. **Try Distance Filter** (requires location permission)
   ```
   distance(lat, lon, userLat, userLon) < 10
   ```
   - Shows emergencies within 10km

6. **Try Time-Based Filter**
   ```
   ageMinutes(createdAt) < 60
   ```
   - Shows emergencies created in last hour

7. **Invalid Expression Handling**
   ```
   type ==
   ```
   - Should show error message in red text

## 🔍 Available Variables

When writing filter expressions, these variables are available:

### Request Fields
- `type` - Emergency type (string): "Medical", "Fire", "Flood", "Earthquake", "Accident", "Other"
- `status` - Request status (string): "pending", "assigned", "resolved"
- `description` - Description text (string)
- `requesterId` - ID of person who created request (string)
- `volunteerId` - ID of assigned volunteer or null (string | null)
- `createdAt` - ISO timestamp string (string)

### Location Fields
- `lat` - Latitude (number)
- `lon` - Longitude (number)
- `address` - Address string (string)

### Context Fields
- `userLat` - Current user's latitude (number | null)
- `userLon` - Current user's longitude (number | null)

### Computed Boolean Fields
- `hasVolunteer` - True if volunteer is assigned (boolean)
- `isPending` - True if status is "pending" (boolean)
- `isAssigned` - True if status is "assigned" (boolean)
- `isResolved` - True if status is "resolved" (boolean)

## 🏛️ Design Patterns Used

### 1. Composite Pattern
AST nodes compose into tree structures where each node can contain other nodes.

### 2. Visitor Pattern
Operations (evaluation, optimization, type checking) are separate from node structure, allowing new operations without modifying nodes.

### 3. Interpreter Pattern
The Evaluator interprets the AST to produce values.

### 4. Singleton Pattern
`emergencyFilterDSL` is exported as a singleton instance.

## 🚀 Performance Considerations

### Parsing Performance
- Parser creates AST once per expression
- Reusable AST for multiple evaluations
- O(n) time complexity where n is expression length

### Evaluation Performance
- AST traversal is O(m) where m is number of nodes
- No string parsing during evaluation
- Efficient for filtering large datasets

### Optimization Opportunities
- Cache parsed AST for frequently used expressions
- Add AST optimizer visitor to simplify expressions
- Compile AST to JavaScript functions for faster repeated evaluation

## 🔒 Security Considerations

### Safe Expression Evaluation
- ✅ No `eval()` or `Function()` constructor used
- ✅ Limited operation set (no file I/O, network access, etc.)
- ✅ Sandboxed execution with controlled context
- ✅ Type-safe operations with runtime checks

### Input Validation
- ✅ Parser validates syntax before execution
- ✅ Function argument type checking
- ✅ Error handling for invalid operations
- ✅ Controlled function library (no arbitrary code execution)

## 📚 Learning Resources

### Little Languages
- Jon Bentley - "Programming Pearls" (Little Languages column)
- Martin Fowler - "Domain-Specific Languages"
- "The UNIX Programming Environment" - Kernighan & Pike

### AST & Parsing
- "Crafting Interpreters" - Robert Nystrom
- "Modern Compiler Implementation" - Andrew Appel
- "Parsing Techniques" - Dick Grune & Ceriel Jacobs

### Visitor Pattern
- "Design Patterns" - Gang of Four
- "Refactoring to Patterns" - Joshua Kerievsky

## 🎓 Key Takeaways

### Little Language Concept
A little language is a specialized, domain-specific language designed for a specific problem domain. Benefits:
- **Expressive:** Users write what they want, not how to compute it
- **Safe:** Limited operations prevent dangerous code
- **Flexible:** Easy to extend with new operators/functions
- **Maintainable:** Changes in DSL don't affect UI code

### AST Benefits
- **Reusable:** Parse once, evaluate many times
- **Transformable:** Apply optimizations before execution
- **Analyzable:** Can validate, type-check, or explain expressions
- **Debuggable:** Clear structure for error messages

### Visitor Pattern Advantages
- **Open/Closed Principle:** Add new operations without modifying nodes
- **Separation of Concerns:** Operations separate from data structure
- **Type Safety:** Compiler ensures all node types are handled
- **Extensibility:** Easy to add new visitors for new operations

## 🔮 Future Enhancements

### Potential Features
1. **Saved Filters:** Allow users to save and name custom filters
2. **Filter Templates:** Provide preset filters for common scenarios
3. **Query Builder UI:** Visual drag-drop interface that generates DSL
4. **Performance Metrics:** Show how many requests match before applying
5. **Filter Sharing:** Share filter expressions with other volunteers
6. **Syntax Highlighting:** Color-code expressions in textarea
7. **Auto-complete:** Suggest variables and functions while typing
8. **Filter History:** Remember recently used expressions

### Additional Visitors
- **PrettyPrinter:** Format expressions nicely
- **TypeChecker:** Validate types statically
- **Optimizer:** Simplify expressions (constant folding, etc.)
- **Explainer:** Generate human-readable description of filter

## 📝 Summary

This implementation demonstrates the three core concepts of Little Languages:

1. ✅ **Code as AST Structures:** 7 node types representing all expression forms
2. ✅ **DSL Parser:** Complete lexer and recursive descent parser converting strings to AST
3. ✅ **Visitor Pattern:** Evaluator visitor traverses AST to execute filters

The DSL is **production-ready**, fully **type-safe** (no `any` types), and powers a real feature in the application. Users can write powerful filter expressions to find exactly the emergencies they want to help with.

---

**Total Implementation:**
- 4 core files (ast.ts, parser.ts, evaluator.ts, emergencyFilter.ts)
- 2 integration files (EmergencyFilterPanel.tsx, page.tsx)
- ~800 lines of production code
- 100% type-safe TypeScript
- Zero runtime dependencies
