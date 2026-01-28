---
name: architecture-analyst
description: Comprehensive codebase analysis, architecture design review, and system integration assessment. Use this skill when the user asks to "analyze the code", "review architecture", "check for best practices", "design a system", or "verify integration patterns".
---

# Architecture Analyst

## Overview

This skill empowers Claude to act as a Principal Software Architect, capable of deep codebase analysis, pattern recognition, and architectural decision-making. It focuses on identifying structural issues, enforcing design patterns, and ensuring robust system integration.

## Analysis Protocol

When analyzing a codebase, follow this systematic approach:

### 1. System Mapping (Breadth-First)
- **Goal**: Understand the high-level structure and component relationships.
- **Action**: Read `README.md`, `package.json`, `docker-compose.yml`, and `ARCHITECTURE.md` (if available).
- **Identify**:
    - Tech Stack (Languages, Frameworks, Databases)
    - Key Services/Modules
    - Infrastructure dependencies (Queue, Cache, Database)
    - Entry points (API routes, Main scripts, CLI commands)

### 2. Component Analysis (Depth-First)
- **Goal**: Evaluate specific modules for coherence and quality.
- **Action**: Examine key directories (e.g., `src/`, `lib/`, `api/`).
- **Check**:
    - **Separation of Concerns**: Is business logic separated from presentation/API layers?
    - **Dependency Direction**: Do high-level modules depend on low-level details? (Inversion of Control)
    - **Modularity**: Are components loosely coupled?

### 3. Integration & Data Flow
- **Goal**: Verify how data moves between systems.
- **Action**: Trace a critical user flow (e.g., "User Login" or "Process Order").
- **Check**:
    - **API Contracts**: Are interfaces defined and respected?
    - **Data Consistency**: How are transactions and states managed?
    - **Error Handling**: Are failures propagated or handled gracefully?

## Architecture Principles

Apply these principles during review and design:

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication via shared libraries or utilities.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. Complexity is the enemy of reliability.
- **12-Factor App**: Use environment config, stateless processes, and backing services.

## Integration Best Practices

For systems that integrate multiple services (e.g., Frontend + Backend, Microservices):

1.  **Strict Contracts**: Use schemas (Zod, Protobuf, OpenAPI) to define boundaries.
2.  **Idempotency**: Ensure operations can be safely retried.
3.  **Observability**: Logging and metrics must be pervasive.
4.  **Resilience**: Implement circuit breakers, retries, and timeouts.

## Output Format

When delivering an analysis report:

1.  **Executive Summary**: High-level findings (Health Score, Critical Risks).
2.  **Architectural Diagrams**: Use Mermaid (C4 model or Sequence diagrams) to visualize.
3.  **Detailed Findings**: Grouped by "Architecture", "Code Quality", "Security", "Performance".
4.  **Recommendations**: Actionable steps (Refactor X, Add Y, Deprecate Z).
