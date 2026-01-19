# VEXEL MAS - Copilot-Ready Agent Prompts

## Instructions for GitHub Copilot / Coding Assistants

Use the prompts below with your Copilot Chat Workspace or coding assistant to scaffold each agent's code, config, and tests. Replace `{lang}` with your target stack (e.g., TypeScript/Node.js or Python/FastAPI).

For architecture overview and system design, see [mas-overview.md](./mas-overview.md).

---

## 1) Bridge Agent: Connector

### Prompt:

```
Create the Bridge Agent ({lang}):
- Implements interoperability and protocol translation
- Translates between different API formats (REST/GraphQL/gRPC, proprietary)
- Manages protocol bridges for cross-platform integration
- Skills: API integration, protocol mapping, format conversion

Features:
- Ingest payloads from heterogeneous sources
- Normalize to a unified bridge schema
- Translate out to provider-specific formats
- Configurable bridging rules (YAML/TOML)

Outputs (please generate):
- src/agents/bridge/* with type-safe bridges
- src/agents/bridge/types.ts and schemas
- src/agents/bridge/bridges.{ext} with adapters
- src/agents/bridge/config.{ext}
- tests/unit/queries/bridge.test.ts
```

---

## 2) Sentinel Agent: Guardian

### Prompt:

```
Create the Sentinel Agent ({lang}):
- Manages cryptographic keys, handles signing and verification
- Verifies digital signatures and attestation chains
- Monitors for unauthorized access and anomalies
- Executes security protocols and policies

Features:
- Key management (derive/import/export, KDF support)
- Signing and verification (Ed25519/Ecdsa, configurable curves)
- Session token validation and expiry
- Policy enforcement engine (RBAC, ABAC)

Outputs:
- src/agents/sentinel/crypto.{ext} with sign/verify primitives
- src/agents/sentinel/keys.{ext} for key management
- src/agents/sentinel/policy.{ext} with rules engine
- src/agents/sentinel/monitor.{ext} for alerts/triggers
- tests/unit/security/sentinel.test.ts
```

---

## 3) Sovereign Agent: Keeper

### Prompt:

```
Create the Sovereign Agent ({lang}):
- Manages user preferences and consent
- Controls data sharing with granular permissions
- Enforces privacy rules and data governance

Features:
- Preference store (versioned, auditable)
- Consent ledger (purpose-based, scope, expiration)
- Privacy rule evaluation engine
- Consent revocation and propagation

Outputs:
- src/agents/sovereign/preference.{ext}
- src/agents/sovereign/consent.{ext}
- src/agents/sovereign/privacy.{ext}
- tests/unit/policies/sovereign.test.ts
```

---

## 4) Atlas Agent: Global Navigator

### Prompt:

```
Create the Atlas Agent ({lang}):
- Maps the connected platforms ecosystem
- Finds optimal paths for data flow
- Tracks network topology and state
- Discovers new integration opportunities

Features:
- Graph representation of platform nodes and edges
- Route optimization (latency, cost, trust paths)
- Topology discovery (health probes, schema introspection)
- Dynamic re-routing and fallback planning

Outputs:
- src/agents/atlas/graph.{ext}
- src/agents/atlas/router.{ext}
- src/agents/atlas/discovery.{ext}
- tests/unit/topology/atlas.test.ts
```

---

## 5) Prism Agent: Harmonizer

### Prompt:

```
Create the Prism Agent ({lang}):
- Merges identity fragments from multiple sources
- Normalizes data formats to a unified view
- Resolves conflicts and performs entity resolution
- Present a single, coherent identity profile

Features:
- Schema registry and normalizers per provider
- Conflict resolution strategies (LWW, priority-based, custom)
- Entity deduplication and linking
- Unified view builder (projections/aggregations)

Outputs:
- src/agents/prism/schema.{ext}
- src/agents/prism/normalize.{ext}
- src/agents/prism/resolve.{ext}
- tests/unit/fusion/prism.test.ts
```

---

## 6) Maestro Agent: Orchestrator

### Prompt:

```
Create the Maestro Agent ({lang}):
- Coordinates all agents and distributes workload
- Handles inter-agent communication and message routing
- Manages system state and lifecycle
- Orchestrates workflows and pipelines

Features:
- Command/event bus (async, reliable)
- Scheduler/queue for jobs and retries
- Workflow engine (DAG/steps)
- Health checks and graceful shutdown

Outputs:
- src/maestro/bus.{ext}
- src/maestro/scheduler.{ext}
- src/maestro/workflows.{ext}
- src/maestro/health.{ext}
- tests/integration/maestro.test.ts
```

---

## 7) Weaver Agent: Extender (Plugins)

### Prompt:

```
Create the Weaver Agent ({lang}):
- Provides plugin architecture and SDK interfaces
- Manages developer tools and custom connectors
- Supports community extensions

Features:
- Plugin lifecycle (load/validate/unload)
- Manifest schema for connector definitions
- SDK helpers (base classes, utilities)
- Extension registry and discovery

Outputs:
- src/weaver/registry.{ext}
- src/weaver/sdk.{ext}
- src/weaver/manifest.ts (JSON Schema)
- tests/plugins/weaver.test.ts
```

---

## How to Proceed (Recommended Workflow)

1. **For each agent**: Copy the corresponding prompt into your Copilot Chat workspace and ask it to generate the outputs listed.

2. **Language selection**: Keep the `{lang}` placeholder if you want to allow multiple stacks; or hardcode TypeScript/Node.js (or your chosen stack) for consistency.

3. **Testing**: Run the generated tests after each agent to validate behavior.

4. **Integration**: Use the Maestro bus to wire inter-agent communication once individual agents are scaffolded.

5. **Incremental development**: Build agents one at a time, starting with foundational agents (Sentinel, Maestro) before moving to specialized agents (Bridge, Atlas, Prism).

## Notes

- All agents should follow the same architectural patterns and interfaces for consistency
- Consider implementing a base agent class/interface that all agents extend
- Ensure proper error handling and logging across all agents
- Use dependency injection for better testability
- Document all public APIs and interfaces
