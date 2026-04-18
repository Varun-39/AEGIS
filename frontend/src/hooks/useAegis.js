import { useState, useCallback, useRef } from 'react';

// ============================================================
// Attack Pattern Database
// ============================================================
const ATTACK_PATTERNS = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i, type: 'prompt_injection', severity: 'critical', name: 'Direct Instruction Override' },
  { pattern: /you\s+are\s+(now\s+)?(DAN|evil|unrestricted|jailbroken)/i, type: 'jailbreak', severity: 'critical', name: 'Persona Hijack (DAN)' },
  { pattern: /pretend\s+(you\s+)?(are|can|have|don't\s+have)/i, type: 'jailbreak', severity: 'high', name: 'Persona Manipulation' },
  { pattern: /system\s*prompt|initial\s*instructions|reveal\s*(your)?\s*prompt/i, type: 'prompt_extraction', severity: 'high', name: 'System Prompt Extraction' },
  { pattern: /bypass|override|disable\s*(your)?\s*(safety|filter|guardrail|restriction)/i, type: 'guardrail_bypass', severity: 'critical', name: 'Safety Bypass Attempt' },
  { pattern: /execute\s*(this)?\s*(code|command|script)|run\s*(this)?\s*(shell|bash|cmd)/i, type: 'code_execution', severity: 'critical', name: 'Code Execution Injection' },
  { pattern: /delete\s*(all)?\s*(files|data|database)|drop\s+table|rm\s+-rf/i, type: 'destructive_action', severity: 'critical', name: 'Destructive Action Attempt' },
  { pattern: /\b(password|secret|api[_\s]?key|token|credential|private[_\s]?key)\b/i, type: 'data_exfiltration', severity: 'high', name: 'Credential Exfiltration' },
  { pattern: /act\s+as\s+(a|an|my)\s+(admin|root|superuser|administrator)/i, type: 'privilege_escalation', severity: 'critical', name: 'Privilege Escalation' },
  { pattern: /forget\s+(everything|all|what)|reset\s+(your|context|memory)/i, type: 'memory_poisoning', severity: 'high', name: 'Memory Wipe Attempt' },
  { pattern: /\[system\]|\[INST\]|<\|system\|>|<<SYS>>|<s>\[INST\]/i, type: 'prompt_injection', severity: 'critical', name: 'Token Injection Attack' },
  { pattern: /translate.*to.*base64|encode.*in.*hex|rot13/i, type: 'obfuscation', severity: 'medium', name: 'Encoding Obfuscation' },
  { pattern: /hypothetically|in\s+a\s+fictional\s+scenario|for\s+(a\s+)?(novel|story|research)/i, type: 'jailbreak', severity: 'medium', name: 'Hypothetical Bypass' },
  { pattern: /sudo|chmod|chown|wget\s+http|curl\s+http/i, type: 'code_execution', severity: 'high', name: 'System Command Injection' },
  { pattern: /tool_call|function_call|<tool>|<function>/i, type: 'tool_manipulation', severity: 'critical', name: 'Direct Tool Manipulation' },
];

// ============================================================
// Tool Permissions
// ============================================================
const TOOL_PERMISSIONS = [
  { id: 'file_read', name: 'File Read', icon: '📄', minTrust: 20 },
  { id: 'file_write', name: 'File Write', icon: '✏️', minTrust: 60 },
  { id: 'database', name: 'Database', icon: '🗄️', minTrust: 50 },
  { id: 'api_call', name: 'API Calls', icon: '🌐', minTrust: 40 },
  { id: 'email', name: 'Email Send', icon: '📧', minTrust: 70 },
  { id: 'code_exec', name: 'Code Exec', icon: '⚡', minTrust: 80 },
  { id: 'admin', name: 'Admin Panel', icon: '🔑', minTrust: 90 },
  { id: 'memory', name: 'Memory Write', icon: '🧠', minTrust: 55 },
];

// ============================================================
// Intent Extraction
// ============================================================
const INTENT_MAP = {
  prompt_injection: {
    adversarial: 'Override system instructions to gain unrestricted access',
    legitimate: 'Modify or customize AI behavior for specific use case',
  },
  jailbreak: {
    adversarial: 'Bypass safety guardrails to generate harmful content',
    legitimate: 'Explore AI capabilities and creative applications',
  },
  prompt_extraction: {
    adversarial: 'Extract system prompts to find exploitable vulnerabilities',
    legitimate: 'Understand AI system configuration and capabilities',
  },
  guardrail_bypass: {
    adversarial: 'Disable safety filters for unrestricted harmful output',
    legitimate: 'Adjust content filtering for legitimate use cases',
  },
  code_execution: {
    adversarial: 'Execute arbitrary code for system compromise or data theft',
    legitimate: 'Run code for development or automation tasks',
  },
  destructive_action: {
    adversarial: 'Destroy data, corrupt systems, or cause irreversible damage',
    legitimate: 'Perform legitimate data management operations',
  },
  data_exfiltration: {
    adversarial: 'Steal credentials, API keys, or sensitive data',
    legitimate: 'Retrieve information about security practices',
  },
  privilege_escalation: {
    adversarial: 'Gain unauthorized admin/root access to system',
    legitimate: 'Access features requiring elevated permissions',
  },
  memory_poisoning: {
    adversarial: 'Corrupt AI memory to manipulate future responses',
    legitimate: 'Reset or update conversation context',
  },
  obfuscation: {
    adversarial: 'Hide malicious payload using encoding techniques',
    legitimate: 'Work with encoded data formats',
  },
  tool_manipulation: {
    adversarial: 'Directly invoke internal tools bypassing security layers',
    legitimate: 'Use available tools through standard interface',
  },
};

// ============================================================
// Prompt Reconstruction
// ============================================================
function getReplacementForAttack(type) {
  const replacements = {
    prompt_injection: { text: '[following standard guidelines]', reason: 'Removed instruction override — preserved intent within safety constraints' },
    jailbreak: { text: '[as a helpful AI assistant]', reason: 'Neutralized persona hijack — maintained helpful interaction mode' },
    prompt_extraction: { text: '[about your capabilities]', reason: 'Redirected system prompt extraction → capabilities inquiry' },
    guardrail_bypass: { text: '[within safety guidelines]', reason: 'Removed safety bypass vector — enforced policy compliance' },
    code_execution: { text: '[explain the concept of]', reason: 'Converted execution injection → safe explanation request' },
    destructive_action: { text: '[describe best practices for data management]', reason: 'Neutralized destructive payload → safe management query' },
    data_exfiltration: { text: '[about security best practices]', reason: 'Blocked credential extraction — redirected to security topic' },
    privilege_escalation: { text: '[as a standard user]', reason: 'Downgraded privilege claim — enforced least-privilege policy' },
    memory_poisoning: { text: '[continuing our conversation]', reason: 'Blocked memory manipulation — preserved context integrity' },
    obfuscation: { text: '[in plain text]', reason: 'Removed encoding obfuscation — enforced plaintext policy' },
    tool_manipulation: { text: '[using standard interface]', reason: 'Blocked direct tool invocation — routed through sandbox' },
  };
  return replacements[type] || { text: '[safe query]', reason: 'Neutralized adversarial content' };
}

function reconstructPrompt(original, attacks) {
  let safe = original;
  const changes = [];

  for (const attack of attacks) {
    const match = original.match(attack.matchedPattern);
    if (match) {
      const replacement = getReplacementForAttack(attack.type);
      safe = safe.replace(match[0], replacement.text);
      changes.push({
        original: match[0],
        replacement: replacement.text,
        reason: replacement.reason,
      });
    }
  }

  if (changes.length === 0) {
    safe = "Could you please help me with general information about this topic?";
    changes.push({
      original: original.slice(0, 80) + (original.length > 80 ? '...' : ''),
      replacement: safe,
      reason: "Full prompt was adversarial — replaced with safe equivalent preserving general intent",
    });
  }

  return { safe, changes };
}

// ============================================================
// Attack Graph Data
// ============================================================
const ATTACK_GRAPH_NODES = [
  { id: 'user', label: 'User Input', type: 'source', x: 0, y: 0, z: 0 },
  { id: 'prompt_gate', label: 'Ingress Filter', type: 'defense', x: 2, y: 1, z: 0 },
  { id: 'llm', label: 'LLM Core', type: 'target', x: 4, y: 0, z: 0 },
  { id: 'reasoning', label: 'Intent Analyzer', type: 'defense', x: 3, y: -1, z: 1 },
  { id: 'tool_sandbox', label: 'Exec Sandbox', type: 'defense', x: 5, y: 1.5, z: -1 },
  { id: 'memory', label: 'Memory Guardian', type: 'target', x: 6, y: -1, z: 0 },
  { id: 'output_gate', label: 'Egress Filter', type: 'defense', x: 7, y: 0, z: 1 },
  { id: 'file_system', label: 'File System', type: 'resource', x: 6, y: 2, z: -1 },
  { id: 'database', label: 'Database', type: 'resource', x: 7, y: 2, z: 1 },
  { id: 'api', label: 'External API', type: 'resource', x: 8, y: 1, z: 0 },
  { id: 'output', label: 'User Output', type: 'sink', x: 9, y: 0, z: 0 },
];

const ATTACK_GRAPH_EDGES = [
  { source: 'user', target: 'prompt_gate' },
  { source: 'prompt_gate', target: 'llm' },
  { source: 'llm', target: 'reasoning' },
  { source: 'reasoning', target: 'tool_sandbox' },
  { source: 'tool_sandbox', target: 'file_system' },
  { source: 'tool_sandbox', target: 'database' },
  { source: 'tool_sandbox', target: 'api' },
  { source: 'llm', target: 'memory' },
  { source: 'memory', target: 'llm' },
  { source: 'llm', target: 'output_gate' },
  { source: 'output_gate', target: 'output' },
];

// ============================================================
// Defense Mode Logic
// ============================================================
function computeDefenseMode(trustScore) {
  if (trustScore > 70) return 'normal';
  if (trustScore > 30) return 'elevated';
  return 'lockdown';
}

// ============================================================
// Main Hook
// ============================================================
export function useAegis() {
  const [trustScore, setTrustScore] = useState(100);
  const [defenseMode, setDefenseMode] = useState('normal'); // normal, elevated, lockdown
  const [events, setEvents] = useState([]);
  const [currentAttack, setCurrentAttack] = useState(null);
  const [attackHistory, setAttackHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeNodes, setActiveNodes] = useState([]);
  const [activeEdges, setActiveEdges] = useState([]);
  const [shieldBurst, setShieldBurst] = useState(null);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [autonomousActions, setAutonomousActions] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState({
    ingress: 'nominal',
    intent: 'nominal',
    sandbox: 'nominal',
    memory: 'nominal',
    egress: 'nominal',
  });
  const [timelineEvents, setTimelineEvents] = useState([]);
  const eventIdRef = useRef(0);
  const actionIdRef = useRef(0);
  const sessionStart = useRef(Date.now());

  // Add autonomous action
  const addAction = useCallback((icon, message, type = 'info') => {
    const action = {
      id: ++actionIdRef.current,
      timestamp: new Date(),
      icon,
      message,
      type, // info, warning, critical, recovery
    };
    setAutonomousActions(prev => [action, ...prev].slice(0, 30));
    return action;
  }, []);

  // Analyze prompt
  const analyzePrompt = useCallback(async (prompt) => {
    setIsProcessing(true);
    setTotalAnalyzed(prev => prev + 1);

    try {
      // Try to call the real backend
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, session_id: 'default' }),
      });

      if (!response.ok) throw new Error('Backend unavailable');
      
      const result = await response.json();
      
      // Map backend result to frontend event
      const event = {
        id: result.id,
        timestamp: new Date(result.timestamp),
        prompt: result.prompt,
        isMalicious: result.is_malicious,
        riskScore: result.risk_score,
        severity: result.severity,
        attacks: result.attacks,
        reconstruction: result.reconstruction,
        attackPath: result.attack_path,
        interceptionPoint: result.interception_point,
        layers: result.layers,
        trustScore: result.trust_score,
        defenseMode: computeDefenseMode(result.trust_score),
      };

      // Internal state updates
      setTrustScore(event.trustScore);
      setTotalBlocked(prev => result.is_malicious ? prev + 1 : prev);
      
      const prevMode = defenseMode;
      const newMode = event.defenseMode;
      if (newMode !== prevMode) {
        setDefenseMode(newMode);
        if (newMode === 'elevated' && prevMode === 'normal') addAction('🔶', `DEFENSE ESCALATED → ELEVATED MODE`, 'warning');
        else if (newMode === 'lockdown') addAction('🚨', `DEFENSE ESCALATED → LOCKDOWN MODE`, 'critical');
        else if (newMode === 'normal') addAction('✅', `DEFENSE RESTORED → NORMAL MODE`, 'recovery');
      }

      if (result.is_malicious) {
        addAction('🔍', `Detected ${result.attacks.length} threat(s)`, 'warning');
        addAction('🔄', `Reconstructed prompt — neutralized vector(s)`, 'info');
      }

      // Attack graph path timing
      if (result.is_malicious) {
        setActiveNodes(event.attackPath);
        setActiveEdges(event.attackPath.slice(0, -1).map((n, i) => `${n}-${event.attackPath[i + 1]}`));
        setShieldBurst(event.interceptionPoint);

        setTimeout(() => {
          setActiveNodes([]);
          setActiveEdges([]);
          setShieldBurst(null);
        }, 4000);
      }

      setPipelineStatus({
        ingress: result.layers.prompt_gate.status,
        intent: result.layers.reasoning_monitor.status,
        sandbox: result.layers.tool_sandbox.status,
        memory: result.layers.memory_sentinel.status,
        egress: result.layers.output_gate.status,
      });

      setTimelineEvents(prev => [...prev, {
        id: event.id,
        timestamp: Date.now(),
        severity: event.severity,
        type: event.isMalicious ? (event.attacks[0]?.type || 'unknown') : 'clean',
        label: event.isMalicious ? event.attacks[0]?.name : 'Clean',
      }].slice(-50));

      setCurrentAttack(event);
      setEvents(prev => [event, ...prev].slice(0, 50));
      if (event.isMalicious) setAttackHistory(prev => [event, ...prev].slice(0, 100));

    } catch (error) {
      console.warn('AEGIS Backend offline, falling back to local simulation:', error);
      
      // FALLBACK TO LOCAL SIMULATION (Keep current logic)
      await new Promise(r => setTimeout(r, 500));
      const detectedAttacks = [];
      for (const pattern of ATTACK_PATTERNS) {
        if (pattern.pattern.test(prompt)) {
          detectedAttacks.push({
            ...pattern,
            matchedPattern: pattern.pattern,
            confidence: 0.85 + Math.random() * 0.14,
          });
        }
      }

      const isMalicious = detectedAttacks.length > 0;
      const maxSeverity = isMalicious
        ? detectedAttacks.reduce((max, a) => {
            const order = { critical: 4, high: 3, medium: 2, low: 1 };
            return order[a.severity] > order[max] ? a.severity : max;
          }, 'low')
        : 'safe';

      const riskScore = isMalicious
        ? Math.min(100, detectedAttacks.reduce((sum, a) => {
            const weights = { critical: 35, high: 25, medium: 15, low: 8 };
            return sum + (weights[a.severity] || 10);
          }, 0))
        : 0;

      const prevTrust = trustScore;
      let newTrust;
      if (isMalicious) {
        const decay = { critical: 30, high: 20, medium: 12, low: 5 };
        const totalDecay = detectedAttacks.reduce((sum, a) => sum + (decay[a.severity] || 5), 0);
        newTrust = Math.max(0, prevTrust - totalDecay);
      } else {
        newTrust = Math.min(100, prevTrust + 3);
      }
      setTrustScore(newTrust);

      if (isMalicious) setTotalBlocked(prev => prev + 1);

      const prevMode = defenseMode;
      const newMode = computeDefenseMode(newTrust);

      if (newMode !== prevMode) {
        setDefenseMode(newMode);
        if (newMode === 'elevated' && prevMode === 'normal') addAction('🔶', `DEFENSE ESCALATED (LOC)`, 'warning');
        else if (newMode === 'lockdown') addAction('🚨', `DEFENSE ESCALATED (LOC)`, 'critical');
      }

      const eventId = ++eventIdRef.current;
      const event = {
        id: eventId,
        timestamp: new Date(),
        prompt,
        isMalicious,
        riskScore,
        severity: maxSeverity,
        attacks: detectedAttacks,
        layers: {
          prompt_gate: { status: isMalicious ? 'intercepted' : 'passed' },
          reasoning_monitor: { status: 'nominal' },
          tool_sandbox: { status: 'nominal' },
          memory_sentinel: { status: 'nominal' },
          output_gate: { status: 'nominal' },
        },
        trustScore: newTrust,
        attackPath: isMalicious ? ['user', 'prompt_gate'] : [],
        interceptionPoint: isMalicious ? 'prompt_gate' : null,
      };

      setCurrentAttack(event);
      setEvents(prev => [event, ...prev].slice(0, 50));
    }

    setIsProcessing(false);
  }, [trustScore, defenseMode, addAction]);

  const resetTrust = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/api/reset-trust?session_id=default', { method: 'POST' });
    } catch (e) {
      console.warn('Backend reset failed:', e);
    }
    setTrustScore(100);
    setDefenseMode('normal');
    setPipelineStatus({
      ingress: 'nominal', intent: 'nominal', sandbox: 'nominal', memory: 'nominal', egress: 'nominal',
    });
    addAction('🔄', 'Trust engine reset — all permissions restored, defense mode NORMAL', 'recovery');
  }, [addAction]);

  const getPermissions = useCallback(() => {
    return TOOL_PERMISSIONS.map(tool => ({
      ...tool,
      granted: trustScore >= tool.minTrust,
    }));
  }, [trustScore]);

  const getAttackStats = useCallback(() => {
    const typeCounts = {};
    attackHistory.forEach(e => {
      e.attacks.forEach(a => {
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      });
    });
    return typeCounts;
  }, [attackHistory]);

  const getSessionDuration = useCallback(() => {
    return Math.floor((Date.now() - sessionStart.current) / 1000);
  }, []);

  return {
    trustScore,
    defenseMode,
    events,
    currentAttack,
    attackHistory,
    isProcessing,
    activeNodes,
    activeEdges,
    shieldBurst,
    totalBlocked,
    totalAnalyzed,
    autonomousActions,
    pipelineStatus,
    timelineEvents,
    analyzePrompt,
    resetTrust,
    getPermissions,
    getAttackStats,
    getSessionDuration,
    graphData: { nodes: ATTACK_GRAPH_NODES, edges: ATTACK_GRAPH_EDGES },
  };
}
