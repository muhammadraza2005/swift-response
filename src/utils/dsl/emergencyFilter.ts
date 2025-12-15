/**
 * Emergency Filter DSL - Real Application Implementation
 * Powers the advanced filtering feature for emergency requests
 */

import { IEmergencyRequest, ILocation } from '@/types/models';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { ASTNode } from './ast';

type EvaluatorValue = string | number | boolean | Record<string, unknown> | null | undefined;

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Standard functions available in filter expressions
const filterFunctions: Record<string, (...args: EvaluatorValue[]) => EvaluatorValue> = {
  // Distance calculation
  distance: (lat1: EvaluatorValue, lon1: EvaluatorValue, lat2: EvaluatorValue, lon2: EvaluatorValue): number => {
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lon2 !== 'number') {
      throw new Error('distance() requires 4 numeric arguments');
    }
    return calculateDistance(lat1, lon1, lat2, lon2);
  },
  
  // String operations
  contains: (str: EvaluatorValue, search: EvaluatorValue): boolean => {
    if (typeof str !== 'string' || typeof search !== 'string') {
      return false;
    }
    return str.toLowerCase().includes(search.toLowerCase());
  },
  
  startsWith: (str: EvaluatorValue, prefix: EvaluatorValue): boolean => {
    if (typeof str !== 'string' || typeof prefix !== 'string') {
      return false;
    }
    return str.toLowerCase().startsWith(prefix.toLowerCase());
  },
  
  // Math operations
  abs: (value: EvaluatorValue): number => {
    if (typeof value !== 'number') {
      throw new Error('abs() requires a numeric argument');
    }
    return Math.abs(value);
  },
  
  min: (...args: EvaluatorValue[]): number => {
    const numbers = args.filter((arg): arg is number => typeof arg === 'number');
    if (numbers.length === 0) {
      throw new Error('min() requires at least one numeric argument');
    }
    return Math.min(...numbers);
  },
  
  max: (...args: EvaluatorValue[]): number => {
    const numbers = args.filter((arg): arg is number => typeof arg === 'number');
    if (numbers.length === 0) {
      throw new Error('max() requires at least one numeric argument');
    }
    return Math.max(...numbers);
  },
  
  // Time operations  
  ageMinutes: (timestamp: EvaluatorValue): number => {
    if (typeof timestamp !== 'string') {
      throw new Error('ageMinutes() requires a string timestamp');
    }
    return (Date.now() - new Date(timestamp).getTime()) / 60000;
  },
  
  ageHours: (timestamp: EvaluatorValue): number => {
    if (typeof timestamp !== 'string') {
      throw new Error('ageHours() requires a string timestamp');
    }
    return (Date.now() - new Date(timestamp).getTime()) / 3600000;
  },
};

export interface FilterContext {
  userLat?: number;
  userLon?: number;
}

export class EmergencyFilterDSL {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Parse a filter expression into AST
   */
  parse(expression: string): ASTNode {
    return this.parser.parse(expression);
  }

  /**
   * Evaluate a filter expression against a single request
   */
  evaluate(expression: string, request: IEmergencyRequest, context: FilterContext = {}): boolean {
    // Return true for empty expressions
    if (!expression || !expression.trim()) {
      return true;
    }
    
    try {
      const ast = this.parse(expression);
      
      // Build evaluation context
      const location = request.location as ILocation;
      const evalContext: Record<string, EvaluatorValue> = {
        // Request fields
        type: request.type,
        status: request.status,
        description: request.description,
        requesterId: request.requester_id,
        volunteerId: request.volunteer_id || null,
        createdAt: request.created_at,
        
        // Location fields
        lat: location.lat,
        lon: location.lng,
        address: location.address,
        
        // Context fields
        userLat: context.userLat ?? null,
        userLon: context.userLon ?? null,
        
        // Computed fields
        hasVolunteer: request.volunteer_id !== null && request.volunteer_id !== undefined,
        isPending: request.status === 'pending',
        isAssigned: request.status === 'assigned',
        isResolved: request.status === 'resolved',
      };
      
      const evaluator = new Evaluator(evalContext, filterFunctions);
      const result = ast.accept(evaluator);
      
      return Boolean(result);
    } catch (error) {
      // Silently fail for invalid expressions (e.g., while typing)
      // Return false to filter out when expression is invalid
      return false;
    }
  }

  /**
   * Filter an array of requests using an expression
   */
  filter(
    requests: IEmergencyRequest[],
    expression: string,
    context: FilterContext = {}
  ): IEmergencyRequest[] {
    if (!expression || !expression.trim()) {
      return requests;
    }
    
    // Validate expression first to avoid filtering with invalid expressions
    const validation = this.validate(expression);
    if (!validation.valid) {
      console.debug('Invalid filter expression:', validation.error);
      return requests;
    }
    
    return requests.filter(request => this.evaluate(expression, request, context));
  }

  /**
   * Validate a filter expression (checks if it parses correctly)
   */
  validate(expression: string): { valid: boolean; error?: string } {
    if (!expression.trim()) {
      return { valid: true };
    }
    
    try {
      this.parse(expression);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid expression'
      };
    }
  }
}

// Export singleton instance
export const emergencyFilterDSL = new EmergencyFilterDSL();

// Example filter expressions:
// - Basic: type == "Medical" && status == "pending"
// - Distance: distance(lat, lon, userLat, userLon) < 10
// - Time: ageMinutes(createdAt) < 30
// - Complex: (type == "Medical" || type == "Fire") && !hasVolunteer && distance(lat, lon, userLat, userLon) < 5
// - String search: contains(description, "urgent") || contains(address, "hospital")
