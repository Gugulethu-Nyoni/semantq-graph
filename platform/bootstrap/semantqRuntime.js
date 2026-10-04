/**
 * Semantq Runtime Bootstrap
 */

import { Runtime } from '../../core/runtime/Runtime.js';
import { GraphLoader } from '../../core/graph/GraphLoader.js';
import { GraphExecutor } from '../../core/runtime/GraphExecutor.js';
import { CapabilityRegistry } from '../../core/registry/CapabilityRegistry.js';
import { SSRConsumer } from '../../core/consumers/SSRConsumer.js';
import { EmailConsumer } from '../consumers/EmailConsumer.js';

import { createPostResolve } from '../capabilities/post.resolve.js';
import { createPostPublished } from '../capabilities/post.published.js';
import { createPostPublish } from '../capabilities/post.publish.js';
import { createPublicationResolve } from '../capabilities/publication.resolve.js';
import { createManifestBuilder } from '../capabilities/manifest.builder.js';
import { createMessageDispatch } from '../capabilities/message.dispatch.js';
import { createEmailRender } from '../capabilities/email.render.js';
import { createSubscriberCreate } from '../capabilities/subscriber.create.js';
import { createSubscriberComplete } from '../capabilities/subscriber.complete.js';
import { createSubscriberQuery } from '../capabilities/subscriber.query.js';
import { createAudienceResolver } from '../capabilities/audience.resolve.js';
import { createNewsletterSend } from '../capabilities/newsletter.send.js';
import { createFlowComplete } from '../capabilities/flow.complete.js';
import { createAccessResolver } from '../capabilities/access.resolve.js';
import { createDeliveryResolve } from '../capabilities/delivery.resolve.js';
import { createMailSender } from '../capabilities/mail.send.js';
import { createDeliveryComplete } from '../capabilities/delivery.complete.js';
import { createDeliverySend } from '../capabilities/delivery.send.js';
import { createSSRRender } from '../capabilities/ssr.render.js';
import { createActivityExecute } from '../capabilities/activity.execute.js';
import { createSubscriberFind } from '../capabilities/subscriber.find.js';
import { createSubscriberVerify } from '../capabilities/subscriber.verify.js';


import { TemplateRenderer } from '../renderers/TemplateRenderer.js';
import { EmailRenderer } from '../renderers/EmailRenderer.js';
import { NewsletterRenderer } from '../renderers/NewsletterRenderer.js';

import semantqMailAdapter from '../adapters/mail/semantqMail.adapter.js';
import loadConfigPromise from '../../config_loader.js';


import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createSemantqRuntime({ services, config = {} }) {
  // 1. Load intent map
  const intentMapPath = join(__dirname, '../../core/execution/intent.map.json');
  let intentMap = {};
  
  try {
    const content = fs.readFileSync(intentMapPath, 'utf8');
    intentMap = JSON.parse(content);
    console.log('[SemantqRuntime] ✅ Loaded intents:', Object.keys(intentMap));
    console.log('[SemantqRuntime] ✅ Intent count:', Object.keys(intentMap).length);
  } catch (err) {
    console.error('[SemantqRuntime] ❌ Failed to load intent map:', err.message);
    // Continue with empty intentMap
  }

  // 2. Create registry
  const registry = new CapabilityRegistry();

  // 3. Register capabilities
  registry.register('render.manifest', createManifestBuilder());
  registry.register('email.render', createEmailRender());
  registry.register('subscriber.complete', createSubscriberComplete());
  registry.register('flow.complete', createFlowComplete());
  registry.register('activity.execute', createActivityExecute());

  const postResolveHandler = createPostResolve(services?.posts);
  registry.register('post.resolve', postResolveHandler);
  registry.register('resource.resolve', postResolveHandler);

  if (services?.posts) {
    registry.register('post.publish', createPostPublish(services.posts));
  }

  if (services?.publications) {
    registry.register('publication.resolve', createPublicationResolve(services.publications));
  }

  if (services?.subscribers) {
    registry.register('subscriber.create', createSubscriberCreate(services.subscribers));
    registry.register('subscriber.query', createSubscriberQuery(services.subscribers));
  }

  if (services?.subscriptions) {
    registry.register('audience.resolve', createAudienceResolver(services.subscriptions));
  }

  if (services?.entitlements && services?.subscriptions) {
    registry.register('access.resolve', createAccessResolver(
      services.entitlements,
      services.subscriptions
    ));
  }

  if (services?.delivery && services?.queue) {
    registry.register('delivery.resolve', createDeliveryResolve(services.delivery, services.queue));
    registry.register('delivery.complete', createDeliveryComplete(services.delivery));
    registry.register('delivery.send', createDeliverySend());
  }

  registry.register('mail.send', createMailSender());
  registry.register('ssr.render', createSSRRender());

  const messageDispatch = createMessageDispatch({
    email: semantqMailAdapter
  });
  registry.register('message.dispatch', messageDispatch);

  registry.register('newsletter.send', createNewsletterSend(messageDispatch, config));

  if (services?.delivery && services?.queue) {
    registry.register('post.deliver', createPostPublished(
      registry.get('audience.resolve'),
      services.delivery,
      services.queue
    ));
  }

  if (services?.subscribers) {
  registry.register('subscriber.create', createSubscriberCreate(services.subscribers));
  registry.register('subscriber.query', createSubscriberQuery(services.subscribers));
  registry.register('subscriber.find', createSubscriberFind(services.subscribers));
  registry.register('subscriber.verify', createSubscriberVerify(services.subscribers));
}

  console.log('[SemantqRuntime] Registered capabilities:', Array.from(registry.handlers.keys()));

  // 4. Build the pipeline
  const graphLoader = new GraphLoader();

  const graphExecutor = new GraphExecutor({
    capabilityRegistry: registry,
    graphLoader
  });

  const runtime = new Runtime({
    graphExecutor,
    graphLoader
  });

  // 6. Create consumers
  const htmlRenderer = new TemplateRenderer();
  const emailRenderer = new EmailRenderer();
  const newsletterRenderer = new NewsletterRenderer();

  const htmlConsumer = new SSRConsumer(htmlRenderer);
  const emailConsumer = new EmailConsumer(emailRenderer);

  return {
    runtime,
    consumers: {
      html: htmlConsumer,
      email: emailConsumer,
      newsletter: newsletterRenderer
    },
    registry
  };
}