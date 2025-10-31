import { isWeekend, isDateInRange } from '../utils/dateUtils.js';

/**
 * Evaluates conditions against data
 * Supports:
 * - Simple conditions: { field: "tier", operator: "==", value: "gold" }
 * - Complex conditions with AND/OR: { operator: "AND", conditions: [...] }
 */
export function evaluateCondition(condition, data) {
  if (!condition) {
    return true;
  }

  // Handle compound conditions (AND/OR)
  if (condition.operator === 'AND' && condition.conditions) {
    return condition.conditions.every((cond) =>
      evaluateCondition(cond, data)
    );
  }

  if (condition.operator === 'OR' && condition.conditions) {
    return condition.conditions.some((cond) =>
      evaluateCondition(cond, data)
    );
  }

  // Handle simple conditions
  if (condition.field) {
    return evaluateSimpleCondition(condition, data);
  }

  return true;
}

/**
 * Evaluate a single simple condition
 */
function evaluateSimpleCondition(condition, data) {
  const { field, operator, value } = condition;
  const dataValue = getFieldValue(field, data);

  switch (operator) {
    case '==':
      return dataValue === value;
    case '!=':
      return dataValue !== value;
    case '>':
      return Number(dataValue) > Number(value);
    case '<':
      return Number(dataValue) < Number(value);
    case '>=':
      return Number(dataValue) >= Number(value);
    case '<=':
      return Number(dataValue) <= Number(value);
    case 'IN':
      return Array.isArray(value) && value.includes(dataValue);
    case 'NOT_IN':
      return Array.isArray(value) && !value.includes(dataValue);
    case 'CONTAINS':
      return String(dataValue).includes(String(value));
    case 'STARTS_WITH':
      return String(dataValue).startsWith(String(value));
    case 'ENDS_WITH':
      return String(dataValue).endsWith(String(value));
    case 'IS_WEEKEND':
      return isWeekend(dataValue);
    case 'DATE_RANGE':
      return isDateInRange(dataValue, value.start, value.end);
    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Get field value from data
 * Supports nested fields like "customer.tier"
 */
function getFieldValue(field, data) {
  if (!field || !data) return undefined;

  const parts = field.split('.');
  let value = data;

  for (const part of parts) {
    value = value?.[part];
  }

  return value;
}

export default evaluateCondition;
