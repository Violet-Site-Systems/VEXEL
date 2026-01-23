# VEXEL Architecture Diagrams

This document contains visual diagrams to help understand the VEXEL architecture.

---

## Package Structure Diagram

```mermaid
graph TB
    subgraph "Application Packages"
        Dashboard[Dashboard<br/>React + Vite]
        Subgraph[Subgraph<br/>TheGraph]
        Contracts[Contracts<br/>Solidity]
    end
    
    subgraph "Core Package"
        Core[Core Library<br/>src/]
        API[API Gateway]
        CrossPlatform[Cross-Platform]
        Wallet[Wallet Manager]
        HAAP[HAAP Protocol]
        Badge[Badge Minter]
    end
    
    subgraph "Module Packages"
        Database[Database Module<br/>PostgreSQL]
        IPFS[IPFS Module<br/>Storage]
        KB[Knowledge Base<br/>Arweave]
    end
    
    subgraph "Shared"
        Types[Shared Types]
    end
    
    Types --> Database
    Types --> IPFS
    Types --> KB
    Types --> Core
    
    Database --> KB
    Database --> Core
    IPFS --> Core
    KB --> Core
    
    Core --> Dashboard
    Core --> Subgraph
    
    style Dashboard fill:#61dafb
    style Subgraph fill:#6f41d8
    style Contracts fill:#627eea
    style Core fill:#68d391
    style Database fill:#f6ad55
    style IPFS fill:#ed8936
    style KB fill:#fc8181
    style Types fill:#a0aec0
```

---

## Architecture Layers Diagram

```mermaid
graph TB
    subgraph "Layer 5: Storage"
        IPFS_L[IPFS<br/>Content Addressed]
        Arweave_L[Arweave<br/>Permanent Storage]
    end
    
    subgraph "Layer 4: Data"
        PostgreSQL[PostgreSQL<br/>Agent Metadata]
        Contracts_L[Smart Contracts<br/>On-Chain State]
        TheGraph_L[TheGraph<br/>Event Indexing]
    end
    
    subgraph "Layer 3: API"
        REST[REST API<br/>Express.js]
        WebSocket[WebSocket<br/>Socket.io]
        gRPC_L[gRPC<br/>Agent-to-Agent]
    end
    
    subgraph "Layer 2: Verification"
        HAAP_L[HAAP Protocol<br/>Human Attestation]
        KYC[KYC Service<br/>Verification]
        Badge_L[VERIFIED_HUMAN<br/>ERC-721 Badges]
    end
    
    subgraph "Layer 1: Identity"
        Wallet_L[Wallet Manager<br/>Polygon Wallets]
        Signature[Signature Injector<br/>Cryptographic Signing]
        DID[DID Utils<br/>W3C DIDs]
    end
    
    Wallet_L --> Signature
    Signature --> DID
    DID --> Badge_L
    Badge_L --> HAAP_L
    KYC --> HAAP_L
    HAAP_L --> REST
    REST --> PostgreSQL
    WebSocket --> PostgreSQL
    gRPC_L --> PostgreSQL
    PostgreSQL --> IPFS_L
    PostgreSQL --> Arweave_L
    Contracts_L --> TheGraph_L
    
    style IPFS_L fill:#ed8936
    style Arweave_L fill:#fc8181
    style PostgreSQL fill:#f6ad55
    style Contracts_L fill:#627eea
    style TheGraph_L fill:#6f41d8
    style REST fill:#68d391
    style WebSocket fill:#68d391
    style gRPC_L fill:#68d391
    style HAAP_L fill:#9f7aea
    style KYC fill:#9f7aea
    style Badge_L fill:#9f7aea
    style Wallet_L fill:#4299e1
    style Signature fill:#4299e1
    style DID fill:#4299e1
```

---

## Data Flow: Agent Registration

```mermaid
sequenceDiagram
    participant User
    participant API as API Gateway
    participant Wallet as WalletManager
    participant DID as DID Utils
    participant DB as DatabaseClient
    participant IPFS as IPFSClient
    participant Contract as Smart Contract
    participant WS as WebSocket
    
    User->>API: POST /api/agents
    API->>API: Authenticate & Validate
    API->>Wallet: createWallet(agentId)
    Wallet-->>API: wallet (address, keys)
    API->>DID: generateDID(wallet)
    DID-->>API: did document
    API->>DB: insertAgent(metadata)
    DB-->>API: agent record
    API->>IPFS: add(metadata)
    IPFS-->>API: CID (hash)
    API->>Contract: register(did, CID)
    Contract-->>API: transaction receipt
    API->>WS: broadcast(registration)
    WS-->>User: real-time notification
    API-->>User: 201 Created (agent data)
```

---

## Data Flow: HAAP Protocol

```mermaid
sequenceDiagram
    participant User
    participant HAAP as HAAPProtocol
    participant KYC as KYCService
    participant Wallet as WalletManager
    participant Badge as BadgeMinter
    participant JWT as JWT Token
    
    User->>HAAP: initializeHuman(userId, email)
    HAAP->>KYC: verifyUser(userId, email)
    KYC->>KYC: Perform KYC checks
    KYC-->>HAAP: verification result
    
    alt KYC Approved
        HAAP->>Wallet: createWallet(userId)
        Wallet-->>HAAP: wallet
        HAAP->>HAAP: generateDID(wallet)
        HAAP->>Badge: mintBadge(did, metadata)
        Badge->>Badge: Call ERC-721 contract
        Badge-->>HAAP: tokenId
        HAAP->>JWT: issueAttestationToken(did, tokenId)
        JWT-->>HAAP: attestation token
        HAAP-->>User: {did, badge, attestationToken}
    else KYC Rejected
        HAAP-->>User: KYC verification failed
    end
```

---

## Module Build Dependency Graph

```mermaid
graph LR
    subgraph "Build Order"
        Types[Shared Types<br/>Always First]
        
        subgraph "Independent Modules (Parallel)"
            DB[Database Module]
            IPFS[IPFS Module]
        end
        
        KB[Knowledge Base<br/>Depends on Database]
        Core[Core Library<br/>Uses All Modules]
    end
    
    Types --> DB
    Types --> IPFS
    Types --> KB
    DB --> KB
    DB --> Core
    IPFS --> Core
    KB --> Core
    
    style Types fill:#a0aec0
    style DB fill:#f6ad55
    style IPFS fill:#ed8936
    style KB fill:#fc8181
    style Core fill:#68d391
```

---

## Package Decision Tree

```mermaid
graph TD
    Start[Need to add code?]
    Start --> DiffTech{Different tech<br/>stack?}
    
    DiffTech -->|Yes| NewApp[Create New<br/>Application Package]
    DiffTech -->|No| Optional{Optional<br/>feature?}
    
    Optional -->|Yes| NewModule[Create New<br/>Module Package]
    Optional -->|No| Domain{Clear domain<br/>boundary?}
    
    Domain -->|Yes| BuildPerf{Build performance<br/>benefit?}
    Domain -->|No| Existing[Add to<br/>Existing Package]
    
    BuildPerf -->|Yes| NewModule2[Create New<br/>Module Package]
    BuildPerf -->|No| Coupled{Tightly<br/>coupled?}
    
    Coupled -->|Yes| Existing2[Add to<br/>Existing Package]
    Coupled -->|No| Small{Small<br/>addition?}
    
    Small -->|Yes| Existing3[Add to<br/>Existing Package]
    Small -->|No| Consider[Consider Module<br/>Package]
    
    style NewApp fill:#61dafb
    style NewModule fill:#f6ad55
    style NewModule2 fill:#f6ad55
    style Existing fill:#68d391
    style Existing2 fill:#68d391
    style Existing3 fill:#68d391
    style Consider fill:#fbd38d
```

---

## Testing Strategy

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E[End-to-End Tests<br/>Full Workflows]
        Integration[Integration Tests<br/>Module Interactions]
        Unit[Unit Tests<br/>Individual Functions]
    end
    
    subgraph "Test Types"
        ContractTests[Contract Tests<br/>Hardhat]
        APITests[API Tests<br/>REST/WebSocket]
        ModuleTests[Module Tests<br/>Database, IPFS, KB]
        CoreTests[Core Tests<br/>Wallet, HAAP, etc.]
    end
    
    Unit --> Integration
    Integration --> E2E
    
    CoreTests --> Unit
    ModuleTests --> Unit
    APITests --> Integration
    ContractTests --> Integration
    
    style E2E fill:#fc8181
    style Integration fill:#f6ad55
    style Unit fill:#68d391
    style ContractTests fill:#627eea
    style APITests fill:#9f7aea
    style ModuleTests fill:#ed8936
    style CoreTests fill:#4299e1
```

---

## Development Workflow

```mermaid
graph LR
    subgraph "Development Cycle"
        Clone[Clone Repo]
        Setup[Setup Environment<br/>npm install]
        Branch[Create Branch]
        Code[Write Code<br/>& Tests]
        Build[Build<br/>npm run build]
        Test[Test<br/>npm test]
        Commit[Commit Changes]
        PR[Create PR]
        Review[Code Review]
        Merge[Merge to Main]
    end
    
    Clone --> Setup
    Setup --> Branch
    Branch --> Code
    Code --> Build
    Build --> Test
    Test -->|Pass| Commit
    Test -->|Fail| Code
    Commit --> PR
    PR --> Review
    Review -->|Approved| Merge
    Review -->|Changes Requested| Code
    
    style Clone fill:#a0aec0
    style Setup fill:#a0aec0
    style Branch fill:#4299e1
    style Code fill:#68d391
    style Build fill:#f6ad55
    style Test fill:#ed8936
    style Commit fill:#9f7aea
    style PR fill:#9f7aea
    style Review fill:#fc8181
    style Merge fill:#68d391
```

---

## CI/CD Pipeline

```mermaid
graph LR
    subgraph "Continuous Integration"
        Push[Git Push]
        Checkout[Checkout Code]
        Install[Install Dependencies]
        Lint[Lint Code]
        Build[Build All Packages]
        UnitTest[Unit Tests]
        IntTest[Integration Tests]
        Security[Security Audit]
        Deploy[Deploy]
    end
    
    Push --> Checkout
    Checkout --> Install
    Install --> Lint
    Lint --> Build
    Build --> UnitTest
    UnitTest --> IntTest
    IntTest --> Security
    Security -->|Pass| Deploy
    Security -->|Fail| Fail[Build Failed]
    
    style Push fill:#4299e1
    style Checkout fill:#a0aec0
    style Install fill:#a0aec0
    style Lint fill:#f6ad55
    style Build fill:#68d391
    style UnitTest fill:#ed8936
    style IntTest fill:#ed8936
    style Security fill:#fc8181
    style Deploy fill:#68d391
    style Fail fill:#fc8181
```

---

## Module Communication Patterns

```mermaid
graph TB
    subgraph "Core Library"
        Vexel[Vexel Class<br/>Main API]
    end
    
    subgraph "Modules (Independent)"
        DB[DatabaseClient]
        IPFS[IPFSClient]
        KB[KnowledgeBaseMigration]
    end
    
    subgraph "Services (Core)"
        Wallet[WalletManager]
        HAAP[HAAPProtocol]
        API[APIGateway]
    end
    
    Vexel --> Wallet
    Vexel --> HAAP
    Vexel --> API
    
    Wallet -.imports.-> DB
    HAAP -.imports.-> DB
    API -.imports.-> DB
    
    Wallet -.imports.-> IPFS
    API -.imports.-> IPFS
    
    KB -.imports.-> DB
    
    style Vexel fill:#68d391
    style DB fill:#f6ad55
    style IPFS fill:#ed8936
    style KB fill:#fc8181
    style Wallet fill:#4299e1
    style HAAP fill:#9f7aea
    style API fill:#61dafb
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Application Layer"
            RateLimit[Rate Limiting]
            CORS[CORS Policy]
            Helmet[Helmet Security]
        end
        
        subgraph "Authentication Layer"
            JWT[JWT Tokens]
            RBAC[RBAC Authorization]
        end
        
        subgraph "Data Layer"
            Encryption[Wallet Encryption<br/>AES-256]
            ParamQueries[Parameterized Queries]
        end
        
        subgraph "Network Layer"
            TLS[TLS/HTTPS]
            Firewall[Firewall Rules]
        end
    end
    
    User[User Request]
    User --> TLS
    TLS --> Firewall
    Firewall --> RateLimit
    RateLimit --> CORS
    CORS --> Helmet
    Helmet --> JWT
    JWT --> RBAC
    RBAC --> ParamQueries
    ParamQueries --> Encryption
    
    style User fill:#a0aec0
    style TLS fill:#fc8181
    style Firewall fill:#fc8181
    style RateLimit fill:#f6ad55
    style CORS fill:#f6ad55
    style Helmet fill:#f6ad55
    style JWT fill:#9f7aea
    style RBAC fill:#9f7aea
    style Encryption fill:#4299e1
    style ParamQueries fill:#4299e1
```

---

## Usage Instructions

### Rendering Mermaid Diagrams

These diagrams use Mermaid syntax and can be rendered:

1. **On GitHub**: GitHub automatically renders Mermaid diagrams in Markdown
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension
3. **Online**: Use [Mermaid Live Editor](https://mermaid.live/)
4. **Documentation sites**: Most static site generators support Mermaid

### Exporting Diagrams

To export as images:

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Export specific diagram
mmdc -i DIAGRAMS.md -o output.png

# Or use online editor and download
```

### Embedding in Documentation

Reference diagrams in other docs:

```markdown
See [Package Structure Diagram](./DIAGRAMS.md#package-structure-diagram)
```

---

## Updating Diagrams

When architecture changes:

1. Update relevant diagram(s) in this file
2. Update corresponding text documentation
3. Test rendering in GitHub preview
4. Commit both code and diagram changes together

---

**Last Updated**: January 2026  
**Maintained By**: VEXEL Contributors  
**Diagram Format**: Mermaid (text-based, version-controlled)
