/**
 * Finite State Machine (Automata) Implementation
 * 
 * Demonstrates:
 * - Deterministic Finite Automaton (DFA)
 * - State transitions and validation
 * - Accepting/rejecting states
 * - State machine for workflow management
 * 
 * Applied to: Emergency Request Status Workflow
 */

/**
 * FSM States for Emergency Request
 * 
 * State Diagram:
 * ┌─────────┐  volunteer   ┌──────────┐  start_work  ┌─────────────┐
 * │ pending │─────────────→│ assigned │─────────────→│ in_progress │
 * └─────────┘              └──────────┘              └─────────────┘
 *     │                        │                            │
 *     │ cancel                 │ cancel                     │ complete
 *     ↓                        ↓                            ↓
 * ┌───────────┐            ┌───────────┐              ┌──────────┐
 * │ cancelled │←───────────│ cancelled │              │ resolved │
 * └───────────┘            └───────────┘              └──────────┘
 *  (rejected)              (rejected)                   (accepting)
 */
export type EmergencyRequestState = 
  | 'pending'      // Initial state
  | 'assigned'     // Volunteer assigned
  | 'in_progress'  // Work started
  | 'resolved'     // Completed (accepting state)
  | 'cancelled';   // Cancelled (rejected state)

/**
 * FSM Transitions (Input Alphabet)
 */
export type EmergencyRequestAction =
  | 'volunteer'   // Volunteer takes the request
  | 'start_work'  // Volunteer starts working
  | 'complete'    // Work completed
  | 'cancel'      // Request cancelled
  | 'reassign';   // Assign to different volunteer

/**
 * Transition Function δ: Q × Σ → Q
 * Maps (current_state, input) to next_state
 */
type TransitionTable = {
  [K in EmergencyRequestState]?: {
    [A in EmergencyRequestAction]?: EmergencyRequestState;
  };
};

/**
 * DFA Definition
 * 
 * M = (Q, Σ, δ, q₀, F) where:
 * - Q: Set of states
 * - Σ: Input alphabet (actions)
 * - δ: Transition function
 * - q₀: Initial state
 * - F: Set of accepting states
 */
export class EmergencyRequestFSM {
  // Q: Set of all states
  private readonly states: Set<EmergencyRequestState> = new Set([
    'pending',
    'assigned',
    'in_progress',
    'resolved',
    'cancelled',
  ]);

  // q₀: Initial state
  private readonly initialState: EmergencyRequestState = 'pending';

  // F: Accepting states (final, successful states)
  private readonly acceptingStates: Set<EmergencyRequestState> = new Set([
    'resolved',
  ]);

  // Rejecting states (final, unsuccessful states)
  private readonly rejectingStates: Set<EmergencyRequestState> = new Set([
    'cancelled',
  ]);

  // δ: Transition function (state table)
  private readonly transitions: TransitionTable = {
    pending: {
      volunteer: 'assigned',
      cancel: 'cancelled',
    },
    assigned: {
      start_work: 'in_progress',
      cancel: 'cancelled',
      reassign: 'pending',
    },
    in_progress: {
      complete: 'resolved',
      cancel: 'cancelled',
    },
    resolved: {
      // Terminal accepting state - no transitions
    },
    cancelled: {
      // Terminal rejecting state - no transitions
    },
  };

  private currentState: EmergencyRequestState;

  constructor(initialState: EmergencyRequestState = 'pending') {
    if (!this.states.has(initialState)) {
      throw new Error(`Invalid initial state: ${initialState}`);
    }
    this.currentState = initialState;
  }

  /**
   * Transition function δ(q, a) → q'
   * Applies action to current state
   */
  transition(action: EmergencyRequestAction): boolean {
    const currentTransitions = this.transitions[this.currentState];
    
    if (!currentTransitions || !currentTransitions[action]) {
      // Invalid transition - DFA rejects
      return false;
    }

    const nextState = currentTransitions[action];
    this.currentState = nextState!;
    return true;
  }

  /**
   * Check if action is valid from current state
   */
  canTransition(action: EmergencyRequestAction): boolean {
    const currentTransitions = this.transitions[this.currentState];
    return !!(currentTransitions && currentTransitions[action]);
  }

  /**
   * Get valid actions from current state
   */
  getValidActions(): EmergencyRequestAction[] {
    const currentTransitions = this.transitions[this.currentState];
    if (!currentTransitions) return [];
    
    return Object.keys(currentTransitions) as EmergencyRequestAction[];
  }

  /**
   * Check if current state is accepting (successful completion)
   */
  isAccepting(): boolean {
    return this.acceptingStates.has(this.currentState);
  }

  /**
   * Check if current state is rejecting (failed/cancelled)
   */
  isRejecting(): boolean {
    return this.rejectingStates.has(this.currentState);
  }

  /**
   * Check if FSM is in terminal state (no more transitions)
   */
  isTerminal(): boolean {
    return this.isAccepting() || this.isRejecting();
  }

  /**
   * Get current state
   */
  getState(): EmergencyRequestState {
    return this.currentState;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentState = this.initialState;
  }

  /**
   * Process a sequence of actions (run the automaton)
   * Returns true if accepted, false if rejected
   */
  processSequence(actions: EmergencyRequestAction[]): boolean {
    this.reset();
    
    for (const action of actions) {
      if (!this.transition(action)) {
        return false; // Invalid transition - reject
      }
    }
    
    return this.isAccepting();
  }

  /**
   * Get state metadata
   */
  getStateInfo(): {
    state: EmergencyRequestState;
    isAccepting: boolean;
    isRejecting: boolean;
    isTerminal: boolean;
    validActions: EmergencyRequestAction[];
  } {
    return {
      state: this.currentState,
      isAccepting: this.isAccepting(),
      isRejecting: this.isRejecting(),
      isTerminal: this.isTerminal(),
      validActions: this.getValidActions(),
    };
  }
}

/**
 * NFA Example: Non-deterministic matching for patterns
 * 
 * Example: Match emergency types with flexible patterns
 * Can be in multiple states simultaneously
 */
export class EmergencyTypeNFA {
  private currentStates: Set<string>;

  constructor() {
    this.currentStates = new Set(['q0']); // Start state
  }

  /**
   * ε-transitions (epsilon/empty transitions)
   * Move without consuming input
   */
  private epsilonClosure(states: Set<string>): Set<string> {
    const closure = new Set(states);
    let changed = true;

    while (changed) {
      changed = false;
      for (const state of closure) {
        // Add epsilon transitions
        if (state === 'q0') {
          if (!closure.has('q1')) {
            closure.add('q1');
            changed = true;
          }
        }
      }
    }

    return closure;
  }

  /**
   * Process input character
   * NFA can transition to multiple states
   */
  process(char: string): void {
    const nextStates = new Set<string>();

    for (const state of this.currentStates) {
      // Define transitions
      if (state === 'q0' && char === 'm') {
        nextStates.add('q1');
      } else if (state === 'q1' && char === 'e') {
        nextStates.add('q2');
      } else if (state === 'q2' && char === 'd') {
        nextStates.add('q3');
      }
      // Add more patterns...
    }

    this.currentStates = this.epsilonClosure(nextStates);
  }

  /**
   * Check if in accepting state
   */
  isAccepting(): boolean {
    return this.currentStates.has('q3'); // 'med' pattern matched
  }
}

/**
 * FSM Validator - Validates state transitions for emergency requests
 */
export class EmergencyWorkflowValidator {
  /**
   * Validate if action is allowed for given state
   */
  static validateTransition(
    currentState: EmergencyRequestState,
    action: EmergencyRequestAction
  ): { valid: boolean; error?: string; nextState?: EmergencyRequestState } {
    const fsm = new EmergencyRequestFSM(currentState);
    
    if (!fsm.canTransition(action)) {
      return {
        valid: false,
        error: `Cannot perform '${action}' from state '${currentState}'. Valid actions: ${fsm.getValidActions().join(', ')}`,
      };
    }

    fsm.transition(action);
    return {
      valid: true,
      nextState: fsm.getState(),
    };
  }

  /**
   * Get workflow visualization
   */
  static getWorkflowPath(
    currentState: EmergencyRequestState
  ): {
    completed: string[];
    current: string;
    remaining: string[];
  } {
    const allStates = ['pending', 'assigned', 'in_progress', 'resolved'];
    const currentIndex = allStates.indexOf(currentState);

    return {
      completed: allStates.slice(0, currentIndex),
      current: currentState,
      remaining: allStates.slice(currentIndex + 1),
    };
  }

  /**
   * Check if workflow is complete
   */
  static isWorkflowComplete(state: EmergencyRequestState): boolean {
    const fsm = new EmergencyRequestFSM(state);
    return fsm.isTerminal();
  }

  /**
   * Simulate workflow from start to end
   */
  static simulateWorkflow(
    actions: EmergencyRequestAction[]
  ): {
    success: boolean;
    states: EmergencyRequestState[];
    failedAt?: number;
  } {
    const fsm = new EmergencyRequestFSM();
    const states: EmergencyRequestState[] = [fsm.getState()];

    for (let i = 0; i < actions.length; i++) {
      if (!fsm.transition(actions[i])) {
        return {
          success: false,
          states,
          failedAt: i,
        };
      }
      states.push(fsm.getState());
    }

    return {
      success: fsm.isAccepting(),
      states,
    };
  }
}
