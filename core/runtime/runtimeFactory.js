/**
 * Semantq Runtime Factory
 * 
 * Single source of truth for runtime creation.
 */

import crypto from 'crypto';
import { createSemantqRuntime } from '../../platform/bootstrap/semantqRuntime.js';
import postService from '../../services/postService.js';
import subscriberService from '../../services/SubscriberService.js';
import publicationService from '../../services/PublicationService.js';
import subscriptionService from '../../services/SubscriptionService.js';
import deliveryService from '../../services/DeliveryService.js';
import queueService from '../../services/QueueService.js';
import entitlementService from '../../services/EntitlementService.js';

let runtimeInstance = null;
let consumersInstance = null;
let runtimeMetadata = null;
let isInitialized = false;

export function initializeRuntime(config = {}) {
  if (isInitialized) {
    console.log(`[RuntimeFactory] Using existing runtime: ${runtimeMetadata?.id}`);
    return { runtime: runtimeInstance, consumers: consumersInstance };
  }

  runtimeMetadata = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    createdBy: process.pid
  };

  console.log(`[RuntimeFactory] Creating NEW runtime: ${runtimeMetadata.id}`);

  const { runtime, consumers } = createSemantqRuntime({
    services: {
      posts: postService,
      subscribers: subscriberService,
      publications: publicationService,
      subscriptions: subscriptionService,
      delivery: deliveryService,
      queue: queueService,
      entitlements: entitlementService
    },
    config
  });

  runtimeInstance = runtime;
  consumersInstance = consumers;
  isInitialized = true;

  return { runtime, consumers };
}

export function getRuntime() {
  if (!runtimeInstance) {
    throw new Error('Runtime not initialized. Call initializeRuntime() first.');
  }
  return runtimeInstance;
}

export function getConsumers() {
  if (!consumersInstance) {
    throw new Error('Consumers not initialized. Call initializeRuntime() first.');
  }
  return consumersInstance;
}

export function getRuntimeMetadata() {
  return runtimeMetadata;
}
