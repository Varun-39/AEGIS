<div align="center">
  <h1>🛡️ AEGIS</h1>
  <h3>Autonomous Execution Guard for Intelligent Systems</h3>
  <p><b>A full-stack, production-ready LLM security firewall, bidirectional enforcement gateway, and real-time operator console.</b></p>

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
</div>

---

## What is AEGIS?

AEGIS is not a generic cybersecurity-themed UI or a simple keyword filter. It is a strictly engineered, deterministic **Layer 7 Security Gateway** designed entirely around securing Large Language Model (LLM) ingress and egress limits. 

It actively defends enterprise applications against the **OWASP LLM Top 10**, intercepting, evaluating, and mutating malicious behavior natively via a robust set of deterministic pipelines and heuristics before they ever hit the provider or fall back into the hands of the user.

## 🔥 Core Defenses & Capabilities
* **Direct Prompt Injection Guard**: Deep multi-layered scanning using Regex, YARA rules, invisible text detection, and Base64 encoded payload trapping. 
* **Indirect Context Injection Prevention**: Source-aware ingestion dynamically chunks Document and URL uploads, quarantining explicit malicious context boundaries *without* rejecting the entire source.
* **Canary System Leak Detection**: Silently weaves high-entropy token tracking into system prompts. If a model hallucinates or regurgitates its internal configurations, it is instantly blocked at egress.
* **Sensitive Output Validation**: Identifies and traps egressing Secrets and PII. AEGIS does not just block payloads—it actively evaluates truncations and redactions against safe subsets.
* **Premium Operator Diagnostics**: A WebSocket-driven `React/Vite` frontend visualizes live attack trees, tracks contextual threat forensics, and maintains an explicit human-in-the-loop review queue for offline tuning.

---

## 🏗️ Architecture & Engineering Phases

AEGIS was engineered across five strictly defined defense phases tailored for the enterprise boundary. 

### Phase 1: Robust Payload Firewall
Built on **FastAPI** leveraging Pydantic v2 validation limits. The firewall acts as the principal gatekeeper preventing prompt execution if input thresholds trigger anomalies across:
* **Normalizers**: Breaks strings uniformly mapping against Unicode subversions or BIDI overrides.
* **The Scan Engine**: Runs prompt payloads concurrently against explicit rule engines (Regex/YARA) and LLM-Guard adapters (PromptInjection, TokenLimits).
* **Deterministic Policy Engine**: Enforces rigid `ALLOW`, `SANITIZE`, `CHALLENGE`, or `BLOCK` logic persisting directly into asynchronous PostgreSQL via asyncpg & SQLAlchemy 2.

### Phase 2: Live Operator Operations Console
A custom **React & Vite** dashboard fueled natively by WebSocket integration (`/ws/aegis`). 
Instead of logging to a plain text file, the backend dynamically pushes `ATTACK_DETECTED` and `SCAN_COMPLETED` objects. Operators can view real-time attack graph trajectories, trace telemetry limits, and measure their aggregated 'Trust Gauge.'

### Phase 3: Source-Aware Ingress & Quarantines
Defending against Indirect Injections natively by breaking down raw text files or HTTP endpoints.
* **Ingestion Adapters**: Strips DOM tags via BeautifulSoup4 and aligns content uniformly.
* **Overlapping Text Windows**: Orchestrates data across configurable chunk structures.
* **Selective Quarantine**: Rejects strictly malicious fragments mapping back isolated detections against distinct `source_id` limits!

### Phase 4: Secure LLM Proxy Gateway
AEGIS transforms into a bidirectional model boundary pointing exactly via `POST /v1/proxy/chat`. 
* **Pre-LLM Gates**: Explicit execution blocks prevent API charges mapping against known prompt attacks.
* **Post-LLM Egress Scans**: Egress validation enforces explicit `allow`, `redact`, `truncate`, or `block` boundaries before returning endpoints to the user natively. 
* **Data Minimization Constraints**: Only generic structured properties (like `safe_excerpt` and `block_reason`) are bubbled back to the Operator view, preventing accidental PII exposure into external analyst systems!

### Phase 5: Measurable Evaluation & Tuning Frameworks
Security tools require measurable assertions. AEGIS natively bounds its system defenses against offline JSONL evaluation models (`attacks.jsonl`, `benign.jsonl`, `output_leaks.jsonl`):
* **Offline Matrix Generations**: Outputs explicit tracking sets calculating exact `Precision`, `Recall`, `F1 Score`, `FPR`, and `FNR`. 
* **Replay Tooling**: `scripts/attack_replay.py` natively reruns system traces from Production environments against newly modified security schema thresholds. 
* **Human-in-the-Loop Tuners**: Endpoints like `POST /v1/feedback` actively accept Operator corrections mapping across true positives, false positive boundaries natively back into SQL.

---

## 🚀 Getting Started

The stack runs gracefully offline mapping strictly into Docker container structures natively isolating Postgres interfaces robustly.

### 1. Requirements
* Docker & Docker Compose
* OpenSSL (Optional: For custom YARA definitions) 

### 2. Boot the Edge
```bash
git clone https://github.com/YourOrg/AEGIS.git
cd AEGIS
docker-compose up --build
```
* **Frontend Dashboard**: Boundary natively maps `http://localhost:5173`
* **FastAPI Secure Gateway**: Resolves heavily authenticated across `http://localhost:8000`

### 3. Evaluate your System!
```bash
# Run AEGIS against rigorous local testing bounds!
python prompt-firewall/scripts/run_eval_suite.py
```

---

## 🔒 Configuration & Policies

Operators can manipulate strict runtime behavior explicitly modifying constraint limits safely across YAML limits under `prompt-firewall/conf/policies.yaml`. Update YARA thresholds, define secret expressions natively, or manage the threshold parameters natively dictating when AEGIS falls back to a Quarantine drop mapping!

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

> *AEGIS doesn't chase 100% block rates or zero-latency illusions. We build strict, auditable enterprise boundaries natively preventing generic execution frameworks from becoming enterprise liabilities.*
