import { useState } from 'react';
import { useAegis } from './hooks/useAegis';
import Header from './components/Header';
import AttackGraph3D from './components/AttackGraph3D';
import TrustGauge from './components/TrustGauge';
import PromptChat from './components/PromptChat';
import AttackReport from './components/AttackReport';
import PermissionMatrix from './components/PermissionMatrix';
import ThreatRadar from './components/ThreatRadar';
import PromptDiff from './components/PromptDiff';
import SecurityPosture from './components/SecurityPosture';
import AttackTimeline from './components/AttackTimeline';
import AutonomousActions from './components/AutonomousActions';

export default function App() {
  const aegis = useAegis();
  const [sidebarTab, setSidebarTab] = useState('report');

  // Defense mode CSS class
  const defenseModeClass = aegis.defenseMode === 'elevated' ? 'defense-elevated'
    : aegis.defenseMode === 'lockdown' ? 'defense-lockdown'
    : '';

  return (
    <div className={`dashboard ${defenseModeClass}`}>
      <Header
        trustScore={aegis.trustScore}
        defenseMode={aegis.defenseMode}
        totalBlocked={aegis.totalBlocked}
        totalAnalyzed={aegis.totalAnalyzed}
        pipelineStatus={aegis.pipelineStatus}
        onReset={aegis.resetTrust}
      />

      <div className="dashboard__main">
        <div className="graph-container glass-panel scanline-overlay" style={{ position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          <AttackGraph3D
            graphData={aegis.graphData}
            activeNodes={aegis.activeNodes}
            activeEdges={aegis.activeEdges}
            shieldBurst={aegis.shieldBurst}
            defenseMode={aegis.defenseMode}
          />
          <div className="graph-overlay">
            <ThreatRadar attackStats={aegis.getAttackStats()} defenseMode={aegis.defenseMode} />
          </div>
          <AttackTimeline timelineEvents={aegis.timelineEvents} />
        </div>

        <div className="bottom-panels">
          <PromptChat
            onSubmit={aegis.analyzePrompt}
            isProcessing={aegis.isProcessing}
            events={aegis.events}
            defenseMode={aegis.defenseMode}
          />
          <AutonomousActions actions={aegis.autonomousActions} />
        </div>
      </div>

      <div className="dashboard__sidebar">
        <SecurityPosture
          trustScore={aegis.trustScore}
          defenseMode={aegis.defenseMode}
          totalBlocked={aegis.totalBlocked}
          totalAnalyzed={aegis.totalAnalyzed}
          pipelineStatus={aegis.pipelineStatus}
          getSessionDuration={aegis.getSessionDuration}
        />

        <TrustGauge score={aegis.trustScore} defenseMode={aegis.defenseMode} />

        <PermissionMatrix permissions={aegis.getPermissions()} trustScore={aegis.trustScore} defenseMode={aegis.defenseMode} />

        <div className="sidebar-tabs glass-panel">
          <div className="sidebar-tabs__header">
            <button
              className={`sidebar-tab ${sidebarTab === 'report' ? 'sidebar-tab--active' : ''}`}
              onClick={() => setSidebarTab('report')}
            >
              Forensics
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'diff' ? 'sidebar-tab--active' : ''}`}
              onClick={() => setSidebarTab('diff')}
            >
              Repair
            </button>
          </div>
          <div className="sidebar-tabs__content">
            {sidebarTab === 'report' && <AttackReport attack={aegis.currentAttack} />}
            {sidebarTab === 'diff' && <PromptDiff attack={aegis.currentAttack} />}
          </div>
        </div>
      </div>
    </div>
  );
}
