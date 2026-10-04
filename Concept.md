                         SEMANTQQL
────────────────────────────────────────────────────────────────────

                    INVOCATION CHANNELS
              HTTP          CLI          AGENT
                │             │             │
                └─────────────┼─────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │      ROUTE        │
                    │ transport adapter │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    CONTROLLER     │
                    │                   │
                    │  Intent Boundary  │
                    └─────────┬─────────┘
                              │
                              │ resolve / invoke intent
                              ▼
             ┌─────────────────────────────────────┐
             │          @semantq/graph             │
             │                                     │
             │  INTENT                             │
             │  product.create                     │
             │       │                             │
             │       ▼                             │
             │  EXECUTABLE GRAPH / IR              │
             │                                     │
             │  validate                           │
             │       ↓                             │
             │  authorize                          │
             │       ↓                             │
             │  create                             │
             │       ↓                             │
             │  inventory.init                     │
             │       ↓                             │
             │  audit                              │
             │       │                             │
             │       ▼                             │
             │  CAPABILITY RESOLUTION              │
             └────────────────┬────────────────────┘
                              │
                              │ delegates execution
                              ▼
             ┌─────────────────────────────────────┐
             │            MCSR SUBSTRATE            │
             │                                     │
             │   SERVICES                          │
             │      │                              │
             │      ▼                              │
             │   MODELS                            │
             │      │                              │
             │      ▼                              │
             │   DATABASE                          │
             └─────────────────────────────────────┘
                              │
                              ▼
                           RESULT
                              │
                              ▼
                  Representation / Response
                   JSON / HTML / CLI / etc.