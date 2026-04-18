import { motion, AnimatePresence } from 'framer-motion';

const LAYER_ICONS = {
  ingress_filter: '🚪',
  intent_analyzer: '🧠',
  execution_sandbox: '🔧',
  memory_guardian: '💾',
  egress_filter: '📤',
};

const LAYER_NAMES = {
  ingress_filter: 'Ingress Filter',
  intent_analyzer: 'Intent Analyzer',
  execution_sandbox: 'Execution Sandbox',
  memory_guardian: 'Memory Guardian',
  egress_filter: 'Egress Filter',
};

const STATUS_STYLES = {
  intercepted: { bg: 'rgba(255,45,85,0.12)', color: 'var(--threat-critical)', label: 'INTERCEPTED' },
  blocked: { bg: 'rgba(255,45,85,0.12)', color: 'var(--threat-critical)', label: 'BLOCKED' },
  quarantined: { bg: 'rgba(255,159,10,0.12)', color: 'var(--threat-medium)', label: 'QUARANTINED' },
  filtered: { bg: 'rgba(255,107,53,0.12)', color: 'var(--threat-high)', label: 'FILTERED' },
  alert: { bg: 'rgba(255,159,10,0.12)', color: 'var(--threat-medium)', label: 'ALERT' },
  passed: { bg: 'rgba(48,209,88,0.06)', color: 'var(--threat-safe)', label: 'PASSED' },
  nominal: { bg: 'rgba(48,209,88,0.03)', color: 'var(--text-tertiary)', label: 'NOMINAL' },
};

export default function AttackReport({ attack }) {
  if (!attack) {
    return (
      <div style={{
        padding: 'var(--space-xl)',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--text-sm)',
      }}>
        <div style={{ fontSize: '28px', marginBottom: 'var(--space-sm)', opacity: 0.5 }}>📋</div>
        <div>Awaiting analysis data</div>
        <div style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
          Submit a prompt to see forensic report
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={attack.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
      >
        {/* Verdict */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: '7px var(--space-md)',
          borderRadius: 'var(--radius-md)',
          background: attack.isMalicious ? 'rgba(255,45,85,0.08)' : 'rgba(48,209,88,0.08)',
          border: `1px solid ${attack.isMalicious ? 'rgba(255,45,85,0.2)' : 'rgba(48,209,88,0.2)'}`,
        }}>
          <span style={{ fontSize: '16px' }}>{attack.isMalicious ? '🚨' : '✅'}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              color: attack.isMalicious ? 'var(--threat-critical)' : 'var(--threat-safe)',
            }}>
              {attack.isMalicious ? 'THREAT INTERCEPTED' : 'PROMPT VERIFIED'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Risk: {attack.riskScore}% │ Mode: {attack.defenseMode?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Intent Analysis (NEW in v2) */}
        {attack.isMalicious && attack.intentAnalysis && (
          <div>
            <div className="section-label" style={{ marginBottom: '6px' }}>Intent Analysis</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--threat-critical)',
                background: 'rgba(255,45,85,0.05)',
                fontSize: '10px',
              }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Adversarial Intent</span>
                <div style={{ color: 'var(--threat-critical)', marginTop: '2px' }}>{attack.intentAnalysis.adversarial}</div>
              </div>
              <div style={{
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--threat-safe)',
                background: 'rgba(48,209,88,0.04)',
                fontSize: '10px',
              }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Legitimate Intent</span>
                <div style={{ color: 'var(--threat-safe)', marginTop: '2px' }}>{attack.intentAnalysis.legitimate}</div>
              </div>
              <div style={{
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--accent-cyan)',
                background: 'rgba(0,240,255,0.04)',
                fontSize: '10px',
              }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AEGIS Action</span>
                <div style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>{attack.intentAnalysis.action}</div>
              </div>
            </div>
          </div>
        )}

        {/* Detected Threats */}
        {attack.isMalicious && attack.attacks.length > 0 && (
          <div>
            <div className="section-label" style={{ marginBottom: '6px' }}>Threat Vectors</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {attack.attacks.map((a, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{a.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className={`badge badge--${a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'warning' : 'info'}`}>
                      {a.severity}
                    </span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {Math.round(a.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Pipeline Status */}
        <div>
          <div className="section-label" style={{ marginBottom: '6px' }}>Security Pipeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {Object.entries(attack.layers).map(([key, layer]) => {
              const status = STATUS_STYLES[layer.status] || STATUS_STYLES.nominal;
              return (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: status.bg,
                  borderLeft: `3px solid ${status.color}`,
                }}>
                  <span style={{ fontSize: '12px' }}>{LAYER_ICONS[key]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                      {LAYER_NAMES[key]}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: status.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interception Path */}
        {attack.interceptionPoint && (
          <div style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0,240,255,0.04)',
            border: '1px solid rgba(0,240,255,0.12)',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Intercepted → </span>
            <span style={{ color: 'var(--mode-accent)', fontWeight: 600 }}>
              {attack.interceptionPoint.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}> │ </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {attack.attackPath.join(' → ')}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
