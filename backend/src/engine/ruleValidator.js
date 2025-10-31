/**
 * Validates rule structure and integrity
 */
export function validateRule(rule) {
  if (!rule) {
    return 'Rule is null or undefined';
  }

  if (!rule.id) {
    return 'Rule must have an id field';
  }

  if (!rule.condition) {
    return 'Rule must have a condition field';
  }

  if (!rule.action) {
    return 'Rule must have an action field';
  }

  if (typeof rule.action !== 'object') {
    return 'Rule action must be an object';
  }

  // Validate condition structure
  const conditionError = validateCondition(rule.condition);
  if (conditionError) {
    return `Invalid condition: ${conditionError}`;
  }

  return null; // No errors
}

/**
 * Recursively validate condition structure
 */
function validateCondition(condition) {
  if (!condition || typeof condition !== 'object') {
    return 'Condition must be an object';
  }

  // Compound conditions (AND/OR)
  if (condition.operator && (condition.operator === 'AND' || condition.operator === 'OR')) {
    if (!Array.isArray(condition.conditions)) {
      return `${condition.operator} requires a conditions array`;
    }

    if (condition.conditions.length === 0) {
      return `${condition.operator} requires at least one condition`;
    }

    // Validate each sub-condition
    for (let i = 0; i < condition.conditions.length; i++) {
      const error = validateCondition(condition.conditions[i]);
      if (error) {
        return `Condition[${i}]: ${error}`;
      }
    }

    return null;
  }

  // Simple conditions
  if (condition.field) {
    if (!condition.operator) {
      return 'Simple condition must have an operator';
    }

    const validOperators = [
      '==', '!=', '>', '<', '>=', '<=',
      'IN', 'NOT_IN',
      'CONTAINS', 'STARTS_WITH', 'ENDS_WITH',
      'IS_WEEKEND', 'DATE_RANGE'
    ];

    if (!validOperators.includes(condition.operator)) {
      return `Unknown operator: ${condition.operator}`;
    }

    // Validate value for specific operators
    if ((condition.operator === 'IN' || condition.operator === 'NOT_IN') &&
        !Array.isArray(condition.value)) {
      return `${condition.operator} operator requires an array value`;
    }

    if (condition.operator === 'DATE_RANGE') {
      if (!condition.value || !condition.value.start || !condition.value.end) {
        return 'DATE_RANGE requires value with start and end properties';
      }
    }

    return null;
  }

  // If operator is specified but no field, it's a compound condition
  if (condition.operator && condition.conditions) {
    // Already validated above
    return null;
  }

  return 'Condition must have either a field (simple) or operator with conditions (compound)';
}

export default validateRule;
