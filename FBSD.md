semantqQL/
│
├── core/
│   ├── execution/
│   │   └── intent.map.json
│   │
│   ├── registry/
│   │   ├── CapabilityRegistry.js
│   │   └── RepresentationRegistry.js
│   │
│   ├── runtime/
│   │   ├── Runtime.js
│   │   ├── GraphExecutor.js
│   │   └── runtimeFactory.js
│   │
│   ├── graph/
│   │   ├── GraphLoader.js
│   │   ├── GraphValidator.js
│   │   └── ...
│   │
│   └── resource/
│       └── ResourceDescriptor.js
│
├── platform/
│   ├── bootstrap/
│   │   └── semantqRuntime.js
│   │
│   ├── capabilities/
│   │   ├── post.resolve.js
│   │   ├── post.publish.js
│   │   ├── ssr.render.js
│   │   └── ...
│   │
│   └── consumers/
│       └── ...
│
├── transport/
│   ├── http/
│   ├── cli/
│   ├── queue/
│   └── cron/
│
├── contracts/
│   └── CapabilityContract.js
│
├── packages/
│   └── @semantq/
│
├── tests/
│
└── docs/