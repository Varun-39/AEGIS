import { motion, AnimatePresence } from 'framer-motion';

export default function PromptDiff({ attack }) {
  if (!attack || !attack.reconstruction) {
    return (
      <div style={{
        padding: 'var(--space-xl)',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--text-sm)',
      }}>
        <div style={{ fontSize: '28px', marginBottom: 'var(--space-sm)', opacity: 0.5 }}>🔄</div>
        <div>No reconstruction data</div>
        <div style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
          Send a malicious prompt to see autonomous repair
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
        <div style={{
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--mode-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          🔄 Repair // Prompt Reconstruction
        </div>

        {/* Original */}
        <div>
          <div style={{
            fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--threat-critical)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ✕ Original (Malicious)
          </div>
          <div style={{
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,45,85,0.05)',
            border: '1px solid rgba(255,45,85,0.12)',
            borderLeft: '3px solid var(--threat-critical)',
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word',
          }}>
            {attack.prompt}
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--mode-accent)', fontSize: '14px', lineHeight: 1 }}>↓</div>

        {/* Reconstructed */}
        <div>
          <div style={{
            fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--threat-safe)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ✓ Reconstructed (Safe)
          </div>
          <div style={{
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(48,209,88,0.04)',
            border: '1px solid rgba(48,209,88,0.12)',
            borderLeft: '3px solid var(--threat-safe)',
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)', lineHeight: 1.5, wordBreak: 'break-word',
          }}>
            {attack.reconstruction.safe}
          </div>
        </div>

        {/* Changes */}
        <div>
          <div style={{
            fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px',
          }}>
            Surgical Changes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {attack.reconstruction.changes.map((change, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                style={{
                  padding: '5px 8px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(123,97,255,0.04)',
                  border: '1px solid rgba(123,97,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', fontSize: '9px', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--threat-critical)', textDecoration: 'line-through', opacity: 0.6, maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {change.original}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                  <span style={{ color: 'var(--threat-safe)' }}>{change.replacement}</span>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  {change.reason}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
