/**
 * CronAdapter
 * 
 * Cron transport adapter for the Runtime.
 * 
 * Responsibilities:
 * 1. Receive cron configuration
 * 2. Build ExecutionContext from schedule
 * 3. Call Runtime.execute()
 * 4. Log result
 */

import { ExecutionContext } from '../../core/runtime/ExecutionContext.js';

export class CronAdapter {
  constructor({ runtime }) {
    this.runtime = runtime;
    this.name = 'cron';
    this.jobs = new Map();
  }

  /**
   * Register a cron job
   * @param {string} name - Job name
   * @param {Object} config - { schedule, intent, params }
   */
  register(name, config) {
    this.jobs.set(name, {
      name,
      schedule: config.schedule,
      intent: config.intent,
      params: config.params || {},
      context: config.context || {}
    });
    return this;
  }

  /**
   * Run a job by name
   */
  async run(name, overrides = {}) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Cron job not found: ${name}`);
    }

    try {
      // Build context
      const context = this.buildContext(job, overrides);

      // Execute
      const result = await this.runtime.execute({
        intent: job.intent,
        params: { ...job.params, ...overrides.params },
        context
      });

      // Log result
      this.logResult(job, result);

      return result;

    } catch (error) {
      console.error(`[Cron] Job ${name} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Build ExecutionContext
   */
  buildContext(job, overrides) {
    return new ExecutionContext({
      transport: 'cron',
      representation: 'json',
      params: { ...job.params, ...overrides.params },
      metadata: {
        source: 'cron',
        job: job.name,
        schedule: job.schedule,
        timestamp: new Date().toISOString()
      },
      principal: { id: 'cron-system' },
      services: {},
      registries: {},
      environment: process.env.NODE_ENV || 'development',
      ...job.context,
      ...overrides.context
    });
  }

  /**
   * Log result
   */
  logResult(job, result) {
    console.log(`[Cron] Job ${job.name} completed:`, {
      timestamp: new Date().toISOString(),
      schedule: job.schedule,
      result: typeof result === 'string' ? result : JSON.stringify(result).slice(0, 200)
    });
  }

  /**
   * List all registered jobs
   */
  list() {
    return Array.from(this.jobs.values()).map(j => ({
      name: j.name,
      schedule: j.schedule,
      intent: j.intent
    }));
  }
}
