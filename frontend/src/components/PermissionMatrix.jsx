import { motion } from 'framer-motion';

export default function PermissionMatrix({ permissions, trustScore, defenseMode }) {
  return (
    <motion.div
      className="glass-panel"
      style={{ padding: 'var(--space-md)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="section-label">Permission Gates</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '5px',
      }}>
        {permissions.map((tool) => (
          <motion.div
            key={tool.id}
            animate={{
              opacity: tool.granted ? 1 : 0.35,
              scale: tool.granted ? 1 : 0.97,
            }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              background: tool.granted
                ? 'rgba(48, 209, 88, 0.05)'
                : defenseMode === 'lockdown'
                  ? 'rgba(255, 45, 85, 0.08)'
                  : 'rgba(255, 45, 85, 0.04)',
              border: `1px solid ${tool.granted
                ? 'rgba(48, 209, 88, 0.12)'
                : defenseMode === 'lockdown'
                  ? 'rgba(255, 45, 85, 0.2)'
                  : 'rgba(255, 45, 85, 0.1)'}`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.5s',
            }}
          >
            {!tool.granted && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,45,85,0.03) 3px, rgba(255,45,85,0.03) 6px)',
                pointerEvents: 'none',
              }} />
            )}

            <span style={{ fontSize: '13px' }}>{tool.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: tool.granted ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>
                {tool.name}
              </div>
              <div style={{
                fontSize: '8px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)',
              }}>
                ≥{tool.minTrust}%
              </div>
            </div>
            <span style={{ fontSize: '10px', opacity: tool.granted ? 0.4 : 0.8 }}>
              {tool.granted ? '🔓' : '🔒'}
            </span>
          </motion.div>
        ))}
      </div>

      <div style={{
        marginTop: 'var(--space-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '8px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-tertiary)',
        marginBottom: '3px',
      }}>
        <span>Quarantine</span>
        <span>Full Access</span>
      </div>
      <div style={{
        width: '100%', height: '4px', borderRadius: '2px',
        background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${trustScore}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: '2px',
            background: trustScore > 70
              ? 'linear-gradient(90deg, var(--threat-safe), var(--accent-green))'
              : trustScore > 40
                ? 'linear-gradient(90deg, var(--threat-medium), var(--threat-low))'
                : 'linear-gradient(90deg, var(--threat-critical), var(--threat-high))',
            boxShadow: `0 0 6px ${trustScore > 70 ? 'var(--threat-safe)' : trustScore > 40 ? 'var(--threat-medium)' : 'var(--threat-critical)'}`,
          }}
        />
      </div>
    </motion.div>
  );
}
