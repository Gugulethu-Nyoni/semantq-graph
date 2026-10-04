export function createActivityExecute() {
  return async function activityExecute(params, context, deps) {
    const { activityService } = context.services;
    const { activityType, resourceUri, targetUri, value, metadata } = params;
    const actorUri = context.actor?.uri || 'system';

    if (!activityService) {
      console.error('[activity.execute] activityService not available');
      throw new Error('Activity service not available');
    }

    const activity = await activityService.create({
      actorUri,
      resourceUri,
      targetUri,
      activityType,
      category: 'user',
      visibility: 'public',
      value: value || metadata || {}
    });

    return {
      success: true,
      activity
    };
  };
}
