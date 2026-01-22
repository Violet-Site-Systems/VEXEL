// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Sentinel Agent - Policy Enforcement Engine
 * RBAC and ABAC policy evaluation for access control
 */

import { PolicyRule, PolicyContext, PolicyEvaluationResult } from './types';

/**
 * Policy engine for access control enforcement
 */
export class PolicyEngine {
  private rules: Map<string, PolicyRule> = new Map();
  private defaultDeny: boolean = true; // Principle of least privilege

  constructor(defaultDeny: boolean = true) {
    this.defaultDeny = defaultDeny;
  }

  /**
   * Add a policy rule to the engine
   * @param rule - Policy rule to add
   */
  addRule(rule: PolicyRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Add multiple rules at once
   * @param rules - Array of policy rules
   */
  addRules(rules: PolicyRule[]): void {
    rules.forEach((rule) => this.addRule(rule));
  }

  /**
   * Remove a policy rule
   * @param ruleId - ID of rule to remove
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Get a rule by ID
   * @param ruleId - Rule identifier
   */
  getRule(ruleId: string): PolicyRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Evaluate access against all applicable rules
   * @param context - Policy evaluation context
   * @returns Evaluation result with matched rules
   */
  evaluate(context: PolicyContext): PolicyEvaluationResult {
    const applicableRules = this.findApplicableRules(context);

    if (applicableRules.length === 0) {
      return {
        allowed: !this.defaultDeny,
        matchedRules: [],
        reason: this.defaultDeny
          ? 'No matching rules found, default deny policy applied'
          : 'No matching rules found, default allow policy applied',
      };
    }

    // Check for explicit deny rules first (deny takes precedence)
    const denyRules = applicableRules.filter((rule) => rule.action === 'deny');
    for (const rule of denyRules) {
      if (this.evaluateConditions(rule, context)) {
        return {
          allowed: false,
          matchedRules: [rule],
          reason: `Access denied by rule: ${rule.name}`,
        };
      }
    }

    // Check for allow rules
    const allowRules = applicableRules.filter((rule) => rule.action === 'allow');
    const matchedAllowRules: PolicyRule[] = [];

    for (const rule of allowRules) {
      if (this.evaluateConditions(rule, context)) {
        matchedAllowRules.push(rule);
      }
    }

    if (matchedAllowRules.length > 0) {
      return {
        allowed: true,
        matchedRules: matchedAllowRules,
        reason: `Access allowed by ${matchedAllowRules.length} matching rule(s)`,
      };
    }

    // No matching allow rule found
    return {
      allowed: false,
      matchedRules: [],
      reason: 'No matching allow rules found, request denied',
    };
  }

  /**
   * Find rules applicable to the given context
   * @param context - Policy evaluation context
   * @returns Array of applicable rules
   */
  private findApplicableRules(context: PolicyContext): PolicyRule[] {
    const now = new Date();

    return Array.from(this.rules.values()).filter((rule) => {
      // Check if rule is expired
      if (rule.expiresAt && rule.expiresAt < now) {
        return false;
      }

      // Check principal pattern match
      if (!this.matchPattern(rule.principal, context.principal)) {
        return false;
      }

      // Check resource pattern match
      if (!this.matchPattern(rule.resource, context.resource)) {
        return false;
      }

      // Note: action in rule is 'allow'/'deny' (the effect), not what action is being requested
      // We match all rules and then evaluate by action type

      return true;
    });
  }

  /**
   * Match a pattern against a value (supports wildcards)
   * @param pattern - Pattern with optional wildcards (*)
   * @param value - Value to match
   * @returns True if pattern matches value
   */
  private matchPattern(pattern: string, value: string): boolean {
    if (pattern === '*') return true;
    if (pattern === value) return true;

    // Handle wildcard patterns like "agent:*" or "*:read"
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*/g, '.*'); // Replace * with regex wildcard

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(value);
  }

  /**
   * Evaluate conditional constraints in a rule
   * @param rule - Rule with conditions
   * @param context - Evaluation context
   * @returns True if all conditions are satisfied
   */
  private evaluateConditions(rule: PolicyRule, context: PolicyContext): boolean {
    if (!rule.conditions || Object.keys(rule.conditions).length === 0) {
      return true; // No conditions, rule applies
    }

    return Object.entries(rule.conditions).every(([key, expectedValue]) => {
      const contextValue = this.getNestedValue(context.context || {}, key);
      return this.evaluateCondition(contextValue, expectedValue);
    });
  }

  /**
   * Get nested value from object using dot notation
   * @param obj - Object to traverse
   * @param path - Dot-notated path (e.g., "user.role")
   * @returns Value at path or undefined
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Evaluate a single condition
   * @param actual - Actual value from context
   * @param expected - Expected value from rule
   * @returns True if condition is satisfied
   */
  private evaluateCondition(actual: any, expected: any): boolean {
    if (expected instanceof RegExp) {
      return expected.test(String(actual));
    }

    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }

    if (typeof expected === 'object' && expected !== null) {
      // Support operators like {$eq: 'value'}, {$gt: 5}, {$in: [1,2,3]}
      if ('$eq' in expected) return actual === expected.$eq;
      if ('$ne' in expected) return actual !== expected.$ne;
      if ('$gt' in expected) return actual > expected.$gt;
      if ('$gte' in expected) return actual >= expected.$gte;
      if ('$lt' in expected) return actual < expected.$lt;
      if ('$lte' in expected) return actual <= expected.$lte;
      if ('$in' in expected) return expected.$in.includes(actual);
      if ('$nin' in expected) return !expected.$nin.includes(actual);
    }

    return actual === expected;
  }

  /**
   * Get all rules
   * @returns All policy rules
   */
  getAllRules(): PolicyRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules for a specific principal
   * @param principal - Principal identifier
   * @returns Rules matching the principal
   */
  getRulesForPrincipal(principal: string): PolicyRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) =>
        rule.principal === principal ||
        rule.principal === '*' ||
        this.matchPattern(rule.principal, principal)
    );
  }

  /**
   * Clear all rules
   */
  clearAllRules(): void {
    this.rules.clear();
  }

  /**
   * Export rules as JSON
   * @returns JSON representation of all rules
   */
  exportRules(): string {
    return JSON.stringify(Array.from(this.rules.values()), null, 2);
  }

  /**
   * Import rules from JSON
   * @param json - JSON string containing rules
   */
  importRules(json: string): void {
    try {
      const rules: PolicyRule[] = JSON.parse(json);
      this.clearAllRules();
      this.addRules(rules);
    } catch (error) {
      throw new Error(`Failed to import rules: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }
}
