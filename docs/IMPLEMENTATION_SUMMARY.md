# Implementation Summary

Brief overview of formal language theory and concurrency concepts implemented in the app.

## Little Languages (DSL)

**[src/utils/dsl/ast.ts](src/utils/dsl/ast.ts)**  
Defines 7 AST node types (Literal, Variable, BinaryOp, UnaryOp, FunctionCall, Conditional, MemberAccess) with visitor interface.

**[src/utils/dsl/parser.ts](src/utils/dsl/parser.ts)**  
Lexer and recursive descent parser with operator precedence that converts filter strings to AST.

**[src/utils/dsl/evaluator.ts](src/utils/dsl/evaluator.ts)**  
Visitor pattern implementation that executes AST nodes to evaluate filter expressions.

**[src/utils/dsl/emergencyFilter.ts](src/utils/dsl/emergencyFilter.ts)**  
Domain-specific DSL integration for filtering emergency requests with predefined functions.

**[src/app/volunteer/page.tsx](src/app/volunteer/page.tsx)**  
Uses DSL for "Advanced Filter" feature allowing complex emergency request filtering.

---

## Concurrency

**[src/utils/concurrency/sharedMemory.ts](src/utils/concurrency/sharedMemory.ts)**  
Thread-safe data structures: ReadWriteLock, Mutex, Semaphore, AtomicCounter, ConcurrentMap.

**[src/utils/concurrency/messagePassing.ts](src/utils/concurrency/messagePassing.ts)**  
Actor model implementation with MessageQueue, Channel, Actor, and EventBus for message-passing concurrency.

**[src/utils/concurrency/raceDetection.ts](src/utils/concurrency/raceDetection.ts)**  
Race condition monitoring and prevention: RaceDetector, TransactionManager, OptimisticLock.

**[src/utils/cache/emergencyCache.ts](src/utils/cache/emergencyCache.ts)**  
Thread-safe emergency request cache using ConcurrentMap and ReadWriteLock with cache statistics.

**[src/utils/messaging/emergencyEvents.ts](src/utils/messaging/emergencyEvents.ts)**  
Actor-based event coordinator for emergency updates using fan-out pattern.

**[src/app/volunteer/page.tsx](src/app/volunteer/page.tsx)**  
Integrates cache-first data fetching, operation tracking, and displays cache hit/miss statistics.

---

## Parser Generation

**[src/utils/dsl/parser.ts](src/utils/dsl/parser.ts)**  
Hand-written recursive descent parser with 8-level precedence hierarchy (ternary → logical → comparison → arithmetic → unary).

**[src/utils/validation/inputGrammar.ts](src/utils/validation/inputGrammar.ts)**  
CFG-based parsers for structured inputs: AddressParser, PhoneParser, EmergencyDescriptionParser.

---

## Automata

**[src/utils/automata/stateMachine.ts](src/utils/automata/stateMachine.ts)**  
Finite State Machine (DFA) for emergency workflow: pending → assigned → in_progress → resolved/cancelled. Includes NFA example.

**[src/components/dashboard/RequestCard.tsx](src/components/dashboard/RequestCard.tsx)**  
Visualizes FSM state transitions, shows valid actions, and indicates accepting/rejecting states.

---

## Grammar & Parsing

**[src/utils/validation/inputGrammar.ts](src/utils/validation/inputGrammar.ts)**  
Context-Free Grammar definitions in BNF notation with regex patterns for address, phone, and description validation.

**[src/components/ContactForm.tsx](src/components/ContactForm.tsx)**  
Integrates grammar-based validation with real-time error display and phone formatting.

---

## Documentation Files

- **LITTLE_LANGUAGE_DSL.md** - Complete DSL documentation with examples
- **CONCURRENCY.md** - Comprehensive concurrency patterns guide
- **CONCURRENCY_ANALYSIS.md** - Where concurrency exists in the app
- **GRAMMAR_PARSING.md** - Grammar concepts and implementation
- **TEST_CONCURRENCY.md** - Testing guide for concurrent features
- **CACHE_TEST_GUIDE.md** - Cache testing scenarios
