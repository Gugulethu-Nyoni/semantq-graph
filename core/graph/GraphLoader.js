/**
 * GraphLoader
 *
 * Loads executable graph definitions.
 *
 * Graph definitions currently live in:
 *   core/execution/intent.map.json
 *
 * The loader owns graph discovery.
 * Runtime and GraphExecutor do not know where graphs come from.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GraphLoader {
  constructor({
    intentMapPath = path.join(
      __dirname,
      '../execution/intent.map.json'
    )
  } = {}) {
    this.intentMapPath = intentMapPath;
    this.intentMap = null;
  }

  async initialize() {
    if (this.intentMap) {
      return this.intentMap;
    }

    const content = await fs.readFile(this.intentMapPath, 'utf8');
    this.intentMap = JSON.parse(content);

    return this.intentMap;
  }

  async load(graphId) {
    const intentMap = await this.initialize();

    const graph = intentMap[graphId];

    if (!graph) {
      throw new Error(`Graph not found: ${graphId}`);
    }

    return structuredClone({
      id: graph.id || graphId,
      ...graph
    });
  }

  async loadByIntent(intent) {
    return this.load(intent);
  }

  async list() {
    const intentMap = await this.initialize();
    return Object.keys(intentMap);
  }
}
