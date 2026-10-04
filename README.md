# Semantq Graph

## Reifying Application Intent as Executable Graphs

**Semantq Graph** is an application-level execution and representation layer for modelling semantically significant application operations as explicit, executable graphs.

It is part of the broader **Semantq software development ecosystem**, centred on **Semantq, a JavaScript framework and programming language** for building applications.

The Semantq ecosystem includes complementary frameworks, libraries, infrastructure components, and application-oriented tools spanning frontend and backend development, data interaction, communication, payments, storage, commerce, SaaS infrastructure, and application execution.

Semantq Graph addresses a specific layer within this ecosystem:

```text
Application Operation
        │
        ▼
Application Intent
        │
        ▼
Executable Graph
        │
        ▼
Capabilities
        │
        ▼
Application Execution
```

It is **not an AI framework** and is not limited to agentic applications. The graph model is intended to be useful for conventional deterministic applications as well as applications that introduce AI or agentic decision-making.


## Table of Contents

* [The Semantq Ecosystem](#the-semantq-ecosystem)
* [What Is Semantq Graph?](#what-is-semantq-graph)
* [The Core Idea](#the-core-idea)
* [Where Graph Fits](#where-graph-fits)
* [Application Intent](#application-intent)
* [Graph Execution](#graph-execution)
* [Transport Independence](#transport-independence)
* [Why Use Graph Without AI?](#why-use-graph-without-ai)
* [Graph and AI](#graph-and-ai)
* [Relationship to semantqQL](#relationship-to-semantqql)
* [Current Architecture](#current-architecture)
* [Research Direction](#research-direction)
* [Project Status](#project-status)
* [Related Projects](#related-projects)


## The Semantq Ecosystem

Semantq Graph is one component within the wider Semantq software development ecosystem.

At the centre is **Semantq**, a JavaScript framework and programming language. Around it are complementary technologies addressing different aspects of application development and operation.

```text
                         SEMANTQ SOFTWARE ECOSYSTEM

┌──────────────────────────────────────────────────────────────────────┐
│                              SEMANTQ                                 │
│                                                                      │
│              JavaScript framework + programming language             │
│                                                                      │
│     Application development • components • runtime • tooling         │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      APPLICATION               DATA &                 PLATFORM
      COMPONENTS              INFRASTRUCTURE           SERVICES
             │                     │                     │
     ┌───────┼────────┐      ┌─────┼─────────┐    ┌──────┼─────────┐
     │       │        │      │     │         │    │      │         │
     ▼       ▼        ▼      ▼     ▼         ▼    ▼      ▼         ▼
  Formique AnyGrid  Cartique Storage  Mail   SMS  Pylon   Pay      ...
                    Ecommerce
```

Other ecosystem components include:

```text
@semantq/storage
@semantq/mail
@semantq/sms
@semantq/pay
@semantq/cartique
@semantq/pylon
Formique
AnyGrid
semantqQL
@semantq/graph
```

These projects address different concerns and are not required to be used together.

Semantq Graph occupies a different architectural concern from most of these components: it provides a representation and execution model for **application-level operations**.

---

## What Is Semantq Graph?

Application frameworks already provide mechanisms for executing application behaviour.

A conventional backend may execute an operation through:

```text
HTTP
 │
 ▼
Route
 │
 ▼
Controller
 │
 ▼
Service
 │
 ▼
Model
 │
 ▼
Database
```

The operation itself, however, may remain distributed across these implementation mechanisms.

Semantq Graph explores an additional representation:

```text
Invocation
    │
    ▼
Application Intent
    │
    ▼
Executable Graph
    │
    ▼
Capabilities
    │
    ▼
Application Implementation
```

The graph does **not** replace routes, controllers, services, models, repositories, or databases.

It provides an application-level representation of **what operation is being performed and what that operation requires**.

---

## The Core Idea

Consider an application operation:

```text
order.refund
```

A conventional implementation might distribute its behaviour across several services:

```text
order.refund
     │
     ├── resolve order
     ├── validate refund
     ├── authorize
     ├── refund payment
     ├── restore inventory
     ├── update order
     └── audit
```

Semantq Graph explores representing that operation explicitly:

```text
                 order.refund
                       │
                       ▼
              ┌─────────────────┐
              │ Executable Graph │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      validate      authorize     refund
                                      │
                           ┌──────────┴──────────┐
                           ▼                     ▼
                       inventory              order
                        restore               update
                           │                     │
                           └──────────┬──────────┘
                                      ▼
                                    audit
```

This creates a distinction between:

```text
WHAT
Application Intent
       │
       ▼
Executable Graph
```

and:

```text
HOW
Capabilities
       │
       ▼
Services / Models / Infrastructure
```

The research and implementation question is whether making this distinction explicit provides useful computational properties that are difficult to obtain when application semantics remain implicit within implementation code.

---

## Where Graph Fits

Semantq Graph is **not a replacement for the Semantq framework or semantqQL**.

It is an application-level abstraction that can operate across the application stack.

```text
                         SEMANTQ
             JavaScript framework + language
                              │
              ┌───────────────┴────────────────┐
              │                                │
              ▼                                ▼
      Application Building              Application Runtime
              │                                │
      ┌───────┼────────┐                       │
      │       │        │                       │
   Formique AnyGrid  Cartique              semantqQL
      │       │        │                       │
      └───────┼────────┘                       │
              │                                │
              └──────────────┬─────────────────┘
                             │
                             ▼
                  APPLICATION IMPLEMENTATION
                             │
                  ┌──────────┼──────────┐
                  │          │          │
                Route   Controller    Service
                                        │
                                        ▼
                                      Model
                             │
                             ▼
                           Data
```

Graph introduces another architectural concern:

```text
                  APPLICATION INTENT
                          │
                          ▼
                 ┌─────────────────┐
                 │  SEMANTQ GRAPH  │
                 │                 │
                 │ Intent           │
                 │ Graph            │
                 │ Capabilities     │
                 │ Execution        │
                 └────────┬────────┘
                          │
                          ▼
                 APPLICATION EXECUTION
```

Graph should therefore not be understood as merely a feature of `semantqQL`.

`semantqQL` is one important application implementation substrate in which the Graph architecture can be implemented and evaluated.

The Graph abstraction itself is intended to remain broader.

---

## Application Intent

An **Intent** represents a semantically significant application operation.

Examples include:

```text
product.create
product.update
order.checkout
order.refund
order.cancel
inventory.transfer
payment.capture
account.close
```

Not every function needs to become an Intent.

The useful boundary is likely to be operations with meaningful application semantics, such as operations that:

* involve multiple execution steps;
* have dependencies;
* require authority or policy;
* require auditing;
* are exposed through multiple invocation mechanisms;
* represent important domain operations;
* may be discovered or invoked by external systems.

The intended relationship is:

```text
Application Intent
        │
        ▼
     Graph
        │
        ▼
   Capabilities
        │
        ▼
 Implementation
```

---

## Graph Execution

The current architectural target is:

```text
Transport
    │
    ▼
Runtime
    │
    ▼
GraphLoader
    │
    ▼
GraphExecutor
    │
    ▼
CapabilityRegistry
    │
    ▼
Capabilities
    │
    ▼
Services / Application Implementation
```

This separates invocation from graph execution and separates graph execution from application implementation.

The graph therefore becomes a reusable execution representation rather than another transport mechanism.

---

## Transport Independence

Transport is deliberately separated from the graph.

```text
                 ┌────────── HTTP
                 │
                 ├────────── CLI
                 │
                 ├────────── Queue
                 │
                 ├────────── Cron
                 │
                 └────────── Application / Agent
                              │
                              ▼
                       Application Intent
                              │
                              ▼
                         Semantq Graph
                              │
                              ▼
                         Capabilities
                              │
                              ▼
                       Application Services
```

An agent is therefore **not a transport layer of Semantq Graph**.

An agent is one possible caller.

The caller may reach the application through HTTP, an SDK, MCP, another protocol, or another integration mechanism.

The graph remains concerned with the application operation itself.

---

## Why Use Graph Without AI?

The value of explicit application graphs does not depend on AI.

A conventional application can use a graph to represent an important operation:

```text
HTTP
 │
 ▼
order.refund
 │
 ▼
Executable Graph
 │
 ├── validate
 ├── authorize
 ├── refund
 ├── restore
 ├── update
 └── audit
 │
 ▼
Application Services
```

Potential uses include:

```text
Pre-execution validation
        │
        ▼
Dependency analysis
        │
        ▼
Capability resolution
        │
        ▼
Policy / authority checks
        │
        ▼
Deterministic execution
        │
        ▼
Semantic execution tracing
```

This can provide value in applications where there is no AI at all.

The graph therefore should not be designed around the assumption that every application will contain an agent.

---

## Graph and AI

AI introduces an additional architectural question.

An AI-enabled application can be designed in many ways:

```text
AI as Interface
       │
       ▼
Application
```

```text
Application
       │
       ▼
AI-assisted Capability
```

```text
AI Agent
       │
       ▼
Application Tools
       │
       ▼
Application
```

Or:

```text
AI Agent
       │
       ▼
Application Intent
       │
       ▼
Semantq Graph
       │
       ▼
Application Execution
```

Semantq Graph does not prescribe one of these architectures.

The question being explored is where an explicit application-intent representation provides the greatest value.

One possible boundary is:

```text
             PROBABILISTIC
                PLANNING
                   │
                   ▼
          ┌──────────────────┐
          │ Application      │
          │ Intent           │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Executable Graph │
          └────────┬─────────┘
                   │
                   ▼
             DETERMINISTIC
              EXECUTION
```

The agent determines **which application operation it wants**.

The application determines **what that operation means and how it executes**.

Whether this provides measurable advantages over high-level tools, MCP interfaces, workflow systems, or other agent architectures remains an open question.

---

## Relationship to semantqQL

`semantqQL` is the Node.js backend framework within the Semantq ecosystem.

It provides the application implementation substrate through which application routes, controllers, services, models, and related backend mechanisms can be organised and executed.

```text
Semantq
   │
   ▼
semantqQL
   │
   ▼
Application
   │
   ├── Routes
   ├── Controllers
   ├── Services
   ├── Models
   └── Data
```

Semantq Graph can operate above this implementation substrate:

```text
Application Intent
       │
       ▼
Semantq Graph
       │
       ▼
Capabilities
       │
       ▼
semantqQL / Application Services
       │
       ▼
Models / Data / Infrastructure
```

This relationship allows the graph architecture to be evaluated using a real application framework without making the graph abstraction conceptually dependent on that framework.

---

## Current Architecture

The repository currently separates the major concerns into:

```text
graph/
│
├── core/
│   ├── execution/
│   ├── graph/
│   ├── registry/
│   ├── resource/
│   └── runtime/
│
├── platform/
│   ├── capabilities/
│   ├── consumers/
│   ├── adapters/
│   ├── renderers/
│   └── bootstrap/
│
├── transport/
│   ├── http/
│   ├── cli/
│   ├── queue/
│   └── cron/
│
├── services/
│
└── contracts/
```

The intended separation is:

```text
TRANSPORT
    │
    ▼
RUNTIME
    │
    ▼
GRAPH
    │
    ▼
CAPABILITIES
    │
    ▼
APPLICATION SERVICES
```

Transport should not contain application orchestration.

Graph should not become another transport mechanism.

Services remain responsible for implementation.

Capabilities provide the executable binding between the graph and application behaviour.

---

## Research Direction

Semantq Graph is both a software architecture project and an experimental research artifact.

The central question is whether **reifying semantically significant application operations as explicit executable representations** provides useful computational properties beyond conventional application architectures.

Areas under investigation include:

```text
Intent Declaration
        │
        ▼
Canonical Representation
        │
        ▼
Static Analysis
        │
        ▼
Capability Resolution
        │
        ▼
Policy / Authority Evaluation
        │
        ▼
Execution
        │
        ▼
Semantic Tracing
```

The investigation also considers the relationship between application Intent representations and:

* intermediate representations;
* workflow engines;
* capability-based architectures;
* policy systems;
* tool protocols;
* MCP;
* agentic architectures;
* conventional application frameworks.

The eventual classification of the representation remains open.

It may prove to be:

```text
Intermediate Representation
        OR
Application Intent Representation
        OR
Executable Application Specification
        OR
Specialised Workflow Representation
```

Determining where the abstraction belongs is part of the research.

For the deeper conceptual and research treatment, see:

* [`Concept.md`](Concept.md)
* [`FBSD.md`](FBSD.md)
* [`AgenticDecisionLayer.md`](AgenticDecisionLayer.md)

---

## Project Status

Semantq Graph is an evolving experimental implementation.

The current repository establishes the architectural direction and execution foundation. Further work will formalise and evaluate:

```text
Intent
  │
  ▼
Graph
  │
  ▼
Analysis
  │
  ▼
Capability Resolution
  │
  ▼
Execution
```

The objective is not simply to demonstrate that a graph can execute.

The objective is to determine **what additional computational and architectural value is created when application intent becomes an explicit executable representation**.

---

## Related Projects

### Semantq

The core **JavaScript framework and programming language** within the ecosystem.

https://github.com/Gugulethu-Nyoni/semantq

### semantqQL

The Node.js backend framework providing an application implementation substrate for Semantq applications.

https://github.com/Gugulethu-Nyoni/semantqQL

### Formique

A JavaScript form-building system within the Semantq ecosystem.

https://github.com/Gugulethu-Nyoni/formique

### AnyGrid

A reusable JavaScript data-grid and data-interaction component within the Semantq ecosystem.

https://github.com/Gugulethu-Nyoni/anygrid

### Semantq Graph

Application intent representation and graph-based execution.

https://github.com/Gugulethu-Nyoni/semantq-graph

---

## Licence

See [`LICENSE`](LICENSE) for licensing information.
