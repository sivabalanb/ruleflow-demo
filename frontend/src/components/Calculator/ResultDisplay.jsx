import { motion } from 'framer-motion';

export default function ResultDisplay({ result, input }) {
  if (!result) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  return (
    <motion.div
      className="result-box"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div style={{ textAlign: 'center', marginBottom: '1.5rem' }} variants={itemVariants}>
        <p style={{ color: '#999', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          Final Price
        </p>
        <motion.div
          className="result-amount"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
        >
          ${result.final_amount.toFixed(2)}
        </motion.div>
        <motion.p
          style={{ color: '#666', fontSize: '0.95rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {result.message}
        </motion.p>
      </motion.div>

      <motion.div className="result-details" variants={containerVariants}>
        {[
          {
            label: 'Original Amount',
            value: `$${result.original_amount.toFixed(2)}`,
          },
          {
            label: 'Total Discount',
            value: `${result.discount_percent}%`,
          },
          {
            label: 'Discount Amount',
            value: `-$${result.discount_amount.toFixed(2)}`,
          },
          {
            label: 'Savings',
            value: `${(
              ((result.original_amount - result.final_amount) / result.original_amount) *
              100
            ).toFixed(1)}%`,
            color: '#10b981',
          },
        ].map((item, idx) => (
          <motion.div key={idx} className="result-item" variants={itemVariants}>
            <div className="result-item-label">{item.label}</div>
            <motion.div
              className="result-item-value"
              style={{ color: item.color }}
              whileHover={{ scale: 1.05 }}
            >
              {item.value}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {result.applied_rules && result.applied_rules.length > 0 && (
        <motion.div variants={itemVariants}>
          <motion.h3
            style={{ marginBottom: '1rem', fontSize: '1rem', color: '#333' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            📋 Applied Rules ({result.applied_rules.length})
          </motion.h3>
          <motion.div className="rules-list" variants={containerVariants}>
            {result.applied_rules.map((rule, index) => (
              <motion.div
                key={index}
                className="rule-item"
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <div className="rule-info">
                  <div className="rule-id">{rule.rule_id}</div>
                  <div className="rule-desc">{rule.description}</div>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' }}>
                    {rule.message}
                  </div>
                </div>
                <motion.div
                  className="rule-discount"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  +{rule.discount_percent}%
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="validation-info"
        style={{ marginTop: '1rem' }}
        variants={itemVariants}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
      >
        ℹ️ <strong>How it works:</strong> Rules are evaluated in priority order. Higher priority
        rules (lower number) take precedence. Non-stackable rules exclude lower-priority matches,
        while stackable rules combine with others.
      </motion.div>
    </motion.div>
  );
}
