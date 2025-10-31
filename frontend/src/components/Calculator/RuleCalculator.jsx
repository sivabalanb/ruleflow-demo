import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateDiscount } from '../../utils/api';
import ResultDisplay from './ResultDisplay';

export default function RuleCalculator() {
  const [formData, setFormData] = useState({
    tier: 'gold',
    total_spend: 1000,
    booking_date: new Date().toISOString().split('T')[0]
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_spend' ? parseFloat(value) || 0 : value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await calculateDiscount(
        formData.tier,
        formData.total_spend,
        formData.booking_date
      );
      setResult(data.result);
    } catch (err) {
      setError(err.message || 'Failed to calculate discount');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      tier: 'gold',
      total_spend: 1000,
      booking_date: new Date().toISOString().split('T')[0]
    });
    setResult(null);
    setError(null);
  };

  const handleQuickTest = (tier, spend) => {
    setFormData((prev) => ({
      ...prev,
      tier,
      total_spend: spend
    }));
  };

  const formVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const resultVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      x: 30,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="calculator-container"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Form Section */}
      <motion.div className="calculator-form" variants={itemVariants}>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="error"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              ❌ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form onSubmit={handleSubmit} variants={itemVariants}>
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="tier">Membership Tier</label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleInputChange}
              required
            >
              <option value="silver">Silver (5% base)</option>
              <option value="gold">Gold (10% base)</option>
              <option value="platinum">Platinum (15% base)</option>
            </select>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="total_spend">Total Spend ($)</label>
            <input
              id="total_spend"
              type="number"
              name="total_spend"
              value={formData.total_spend}
              onChange={handleInputChange}
              min="0"
              step="100"
              required
            />
            <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>
              💡 Spending over $5,000 unlocks bonus discounts!
            </small>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="booking_date">Booking Date</label>
            <input
              id="booking_date"
              type="date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleInputChange}
              required
            />
            <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>
              🎉 Weekends = Extra 5% bonus for Gold & Platinum!
            </small>
          </motion.div>

          <motion.div className="button-group" variants={itemVariants}>
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {loading ? '⏳ Calculating...' : '🧮 Calculate Discount'}
            </motion.button>
            <motion.button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={loading}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Reset
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Quick Test Buttons */}
        <motion.div
          style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e0e0e0',
          }}
          variants={itemVariants}
        >
          <p style={{ marginBottom: '1rem', fontWeight: 600, color: '#666' }}>
            ⚡ Quick Tests:
          </p>
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
            variants={itemVariants}
          >
            {[
              { label: 'Silver + $1K', tier: 'silver', spend: 1000 },
              { label: 'Gold + $3K', tier: 'gold', spend: 3000 },
              { label: 'Gold + $6K', tier: 'gold', spend: 6000 },
              { label: 'Platinum + $8K', tier: 'platinum', spend: 8000 },
              { label: 'Platinum + $10K', tier: 'platinum', spend: 10000 },
            ].map((test, idx) => (
              <motion.button
                key={idx}
                className="btn btn-secondary"
                onClick={() => handleQuickTest(test.tier, test.spend)}
                style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.05,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }}
              >
                {test.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            className="calculator-results"
            key="results"
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ResultDisplay result={result} input={formData} />
          </motion.div>
        ) : (
          <motion.div
            className="calculator-results"
            key="empty"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              color: '#94a3b8',
              textAlign: 'center',
            }}
          >
            <motion.div
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              📊
            </motion.div>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>
              Calculate your discount
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Fill in the form and click "Calculate Discount" to see the results here
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
