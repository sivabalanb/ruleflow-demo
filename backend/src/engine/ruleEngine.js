import { evaluateCondition } from './conditionEvaluator.js';
import { validateRule } from './ruleValidator.js';

/**
 * RuleEngine - Evaluates complex business rules against input data
 * Supports AND/OR logic, multiple conditions, and rule priority
 */
export class RuleEngine {
  constructor(rules = []) {
    this.rules = rules;
    this.validateAllRules();
  }

  validateAllRules() {
    this.rules.forEach((rule) => {
      const error = validateRule(rule);
      if (error) {
        console.warn(`Rule validation warning for "${rule.id}": ${error}`);
      }
    });
  }

  /**
   * Apply rules to data and return matching rules with calculated actions
   * @param {Object} data - Input data to evaluate against rules
   * @returns {Object} - Results including applied rules and aggregated discount
   */
  applyRules(data) {
    const results = {
      original_amount: data.total_spend,
      applied_rules: [],
      total_discount_percent: 0,
      discount_amount: 0,
      final_amount: 0,
      message: 'No rules applied'
    };

    // Sort rules by priority (lower number = higher priority)
    const sortedRules = [...this.rules].sort(
      (a, b) => (a.priority || 999) - (b.priority || 999)
    );

    // Track which rules have been applied (for non-stackable rules)
    const appliedRules = [];

    // Evaluate each rule
    for (const rule of sortedRules) {
      // Check if rule matches conditions
      if (evaluateCondition(rule.condition, data)) {
        // Check if this rule type was already applied (if not stackable)
        const isStackable = rule.action?.stackable !== false;
        const ruleTypeApplied = appliedRules.some(
          (r) => r.rule_id === rule.id
        );

        if (isStackable || !ruleTypeApplied) {
          const action = rule.action || {};
          results.applied_rules.push({
            rule_id: rule.id,
            description: rule.description || rule.id,
            discount_percent: action.discountPercent || 0,
            message: action.message || ''
          });

          results.total_discount_percent += action.discountPercent || 0;
          appliedRules.push({ rule_id: rule.id });
        }
      }
    }

    // Calculate final amounts
    results.discount_amount = parseFloat(
      ((results.original_amount * results.total_discount_percent) / 100).toFixed(2)
    );
    results.final_amount = parseFloat(
      (results.original_amount - results.discount_amount).toFixed(2)
    );

    // Set message
    if (results.applied_rules.length > 0) {
      results.message =
        results.applied_rules.length === 1
          ? results.applied_rules[0].message
          : `${results.applied_rules.length} rules applied for ${results.total_discount_percent}% total discount`;
    }

    return results;
  }

  /**
   * Load rules from array (typically parsed from JSON)
   */
  loadRules(rules) {
    this.rules = rules || [];
    this.validateAllRules();
  }

  /**
   * Get all rules
   */
  getRules() {
    return this.rules;
  }
}

export default RuleEngine;
