import { motion } from 'framer-motion';

const PIPELINE_LAYERS = [
  { key: 'ingress', label: 'Ingress' },
  { key: 'intent', label: 'Intent' },
  { key: 'sandbox', label: 'Sandbox' },
  { key: 'memory', label: 'Memory' },
  { key: 'egress', label: 'Egress' },
];

export default function Header({ trustScore, defenseMode, totalBlocked, totalAnalyzed, pipelineStatus, onReset }) {
  const modeConfig = {
    normal: { label: 'NORMAL', dotClass: '' },
    elevated: { label: 'ELEVATED', dotClass: 'pulse-dot--warning' },
    lockdown: { label: 'LOCKDOWN', dotClass: 'pulse-dot--danger' },
  };

  const mode = modeConfig[defenseMode] || modeConfig.normal;

  return (
    <motion.header
      className="dashboard__header glass-panel"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="logo">
        <div className="logo__icon">🛡️</div>
        <div>
          <div className="logo__text text-gradient">AEGIS</div>
          <div className="logo__tagline">Autonomous Security Kernel</div>
        </div>
      </div>

      <div className="status-bar">
        {/* Pipeline Status Dots */}
        <div className="pipeline-dots" title="Security Pipeline Status">
          {PIPELINE_LAYERS.map(layer => {
            const status = pipelineStatus[layer.key] || 'nominal';
            return (
              <div
                key={layer.key}
                className={`pipeline-dot pipeline-dot--${status}`}
                title={`${layer.label}: ${status.toUpperCase()}`}
              />
            );
          })}
        </div>

        <div className="status-item">
          <span>Scanned</span>
          <span className="status-item__value mono">{totalAnalyzed}</span>
        </div>
        <div className="status-item">
          <span>Blocked</span>
          <span className="status-item__value mono" style={{ color: totalBlocked > 0 ? 'var(--threat-critical)' : 'var(--text-tertiary)' }}>
            {totalBlocked}
          </span>
        </div>
        <div className="status-item">
          <span>Trust</span>
          <span className="status-item__value mono" style={{
            color: trustScore > 70 ? 'var(--threat-safe)' : trustScore > 30 ? 'var(--threat-medium)' : 'var(--threat-critical)',
          }}>
            {trustScore}%
          </span>
        </div>

        {/* Defense Mode Badge */}
        <div className={`defense-badge defense-badge--${defenseMode}`}>
          <div className={`pulse-dot ${mode.dotClass}`} style={{ width: '6px', height: '6px' }} />
          {mode.label}
        </div>

        <button className="btn btn--ghost" onClick={onReset} style={{ padding: '5px 12px', fontSize: '9px' }}>
          Reset
        </button>
      </div>
    </motion.header>
  );
}
