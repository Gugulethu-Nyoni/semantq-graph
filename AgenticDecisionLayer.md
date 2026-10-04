┌──────────────────────────────────────────────────────────────┐
│                    AGENTIC / DECISION LAYER                  │
│                                                              │
│  Agent → Planning → Intent Selection → Policy / Approval     │
│                                                              │
│  The agent DECIDES what should be executed.                  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ Intent / Execution Request
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     SEMANTQ RUNTIME                          │
│                                                              │
│  Runtime → GraphLoader → GraphValidator → GraphExecutor      │
│                                                              │
│  The runtime CONTROLS and EXECUTES the request.              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   CAPABILITY / DOMAIN LAYER                   │
│                                                              │
│  CapabilityRegistry → Capabilities → Services                │
│                                                              │
│  Capabilities define WHAT operations are permitted.          │
│  Services perform the actual domain operations.              │
└──────────────────────────────────────────────────────────────┘


                    EXTERNAL ENTRY POINTS
                            
       ┌──────────┬──────────┬──────────┬──────────┐
       │   HTTP   │   CLI    │  Queue   │   Cron   │
       └────┬─────┴────┬─────┴────┬─────┴────┬─────┘
            │          │          │          │
            └──────────┴──────────┴──────────┘
                              │
                              ▼
                           Runtime