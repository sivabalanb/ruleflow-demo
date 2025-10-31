import { Router } from 'express';
import { RuleEngine } from '../engine/ruleEngine.js';
import { getDayName } from '../utils/dateUtils.js';

const router = Router();
let ruleEngine = null;

/**
 * Initialize the calculator route with rules
 */
export function initCalculateRoute(engine) {
  ruleEngine = engine;
}

/**
 * POST /api/calculate
 * Apply rules to customer data and calculate discount
 */
router.post('/api/calculate', (req, res) => {
  try {
    if (!ruleEngine) {
      return res.status(500).json({
        error: 'Rule engine not initialized'
      });
    }

    const { tier, total_spend, booking_date } = req.body;

    // Validate required fields
    if (!tier || total_spend === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: tier and total_spend',
        example: {
          tier: 'gold',
          total_spend: 1000,
          booking_date: '2025-10-31'
        }
      });
    }

    // Validate tier
    const validTiers = ['silver', 'gold', 'platinum'];
    if (!validTiers.includes(tier.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid tier. Must be one of: ${validTiers.join(', ')}`
      });
    }

    // Validate spend amount
    if (total_spend < 0) {
      return res.status(400).json({
        error: 'total_spend must be a positive number'
      });
    }

    // Use provided date or current date
    const dateToUse = booking_date || new Date().toISOString().split('T')[0];
    const dayOfWeek = getDayName(dateToUse);

    // Prepare data for rule evaluation
    const evaluationData = {
      tier: tier.toLowerCase(),
      total_spend: parseFloat(total_spend),
      booking_date: dateToUse,
      day_of_week: dayOfWeek
    };

    // Apply rules
    const result = ruleEngine.applyRules(evaluationData);

    // Return result with metadata
    res.json({
      success: true,
      input: evaluationData,
      result: {
        original_amount: result.original_amount,
        discount_percent: result.total_discount_percent,
        discount_amount: result.discount_amount,
        final_amount: result.final_amount,
        applied_rules: result.applied_rules,
        message: result.message
      }
    });
  } catch (error) {
    console.error('Error in calculate endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
