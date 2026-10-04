/**
 * CliAdapter
 * 
 * CLI transport adapter for the Runtime.
 * 
 * Responsibilities:
 * 1. Parse CLI arguments
 * 2. Build ExecutionContext from arguments
 * 3. Call Runtime.execute()
 * 4. Write RepresentationResponse to stdout
 */

import { ExecutionContext } from '../../core/runtime/ExecutionContext.js';

export class CliAdapter {
  constructor({ runtime }) {
    this.runtime = runtime;
    this.name = 'cli';
  }

  /**
   * Run a CLI command
   */
  async run(args = process.argv.slice(2)) {
    try {
      // 1. Parse arguments
      const parsed = this.parseArgs(args);

      // 2. Build context
      const context = this.buildContext(parsed);

      // 3. Execute
      const result = await this.runtime.execute({
        intent: parsed.intent || 'view_resource',
        params: parsed.params || {},
        context
      });

      // 4. Print result
      this.writeResult(result, parsed);

    } catch (error) {
      console.error('CLI Error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Parse CLI arguments
   * 
   * Example:
   *   node script.js view_resource --resource post --slug hello-world --format json
   *   → { intent: 'view_resource', params: { resource: 'post', slug: 'hello-world', format: 'json' } }
   */
  parseArgs(args) {
    const intent = args[0] || 'view_resource';
    const params = {};
    const parsed = { intent, params };

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const value = args[i + 1];
        if (value && !value.startsWith('--')) {
          params[key] = value;
          i++;
        } else {
          params[key] = true;
        }
      }
    }

    return parsed;
  }

  /**
   * Build ExecutionContext from CLI args
   */
  buildContext(parsed) {
    const representation = parsed.params.format || parsed.params.representation || 'json';
    const resource = parsed.params.resource || null;

    return new ExecutionContext({
      transport: 'cli',
      representation,
      resource,
      params: parsed.params || {},
      metadata: {
        source: 'cli',
        command: parsed.intent,
        timestamp: new Date().toISOString()
      },
      principal: { id: 'cli-user' },
      services: {},
      registries: {},
      environment: process.env.NODE_ENV || 'development'
    });
  }

  /**
   * Write result to stdout
   */
  writeResult(result, parsed) {
    const format = parsed.params.format || 'json';

    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else if (format === 'html' && result.body) {
      console.log(result.body);
    } else if (typeof result === 'string') {
      console.log(result);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  }

  /**
   * CLI entry point
   */
  static async main({ runtime }) {
    const adapter = new CliAdapter({ runtime });
    await adapter.run();
  }
}
