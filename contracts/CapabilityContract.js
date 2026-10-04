/**
 * CapabilityContract
 * 
 * Validates that a capability implements the required interface.
 * 
 * Requirements:
 * - id string
 * - version string (semver)
 * - execute(context) method
 * - description (optional)
 */

export class CapabilityContract {
  static validate(capability, name) {
    const errors = [];

    // Must have an id
    if (!capability.id) {
      errors.push(`Capability "${name}" missing required property: id`);
    }

    // Must have a version
    if (!capability.version) {
      errors.push(`Capability "${name}" missing required property: version`);
    }

    // Must have an execute method (either as method or as default export)
    const hasExecute = 
      typeof capability.execute === 'function' ||
      typeof capability.default === 'function' ||
      typeof capability === 'function';

    if (!hasExecute) {
      errors.push(`Capability "${name}" missing required method: execute()`);
    }

    if (errors.length > 0) {
      throw new Error(`Capability validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  static check(capability) {
    return {
      hasId: !!capability.id,
      hasVersion: !!capability.version,
      hasExecute: typeof capability.execute === 'function' ||
                   typeof capability.default === 'function' ||
                   typeof capability === 'function',
      isValid: !!capability.id &&
                !!capability.version &&
                (typeof capability.execute === 'function' ||
                 typeof capability.default === 'function' ||
                 typeof capability === 'function')
    };
  }
}
