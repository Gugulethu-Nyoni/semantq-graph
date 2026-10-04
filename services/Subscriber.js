import { MailService } from '@semantq/mail';

/**
 * Subscriber - Email service for Subscriber related emails.
 */
class Subscriber { 
    constructor() {
        this.mail = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return this;
        
        try {
            this.mail = await MailService.create();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Subscriber:', error);
            this.mail = new MailService({
                email: { driver: 'log' },
                brand: { name: 'Our Service' }
            });
            this.initialized = true;
        }
        
        return this;
    }

    /**
     * Send Subscriber email
     * @param {Object} payload - Email payload
     * @param {string[]} payload.recipients - Recipient emails
     * @param {string} payload.subject - Email subject
     * @param {string} payload.template - Template identifier
     * @param {string} [payload.text] - Plain text content
     * @param {string} [payload.html] - HTML content
     * @param {string} [payload.body] - Simple text/HTML
     * @param {Object} [payload.templateData] - Additional template data
     * @param {string[]} [payload.cc] - CC recipients
     * @param {string[]} [payload.bcc] - BCC recipients
     * @param {string} [payload.replyTo] - Reply-to address
     * @param {string} [payload.from] - From address
     * @param {string} [payload.fromName] - From name
     * @param {Object[]} [payload.attachments] - File attachments
     */
    async sendSubscriber(payload) {
        // Ensure template is set
        if (!payload.template) {
            payload.template = 'subscriber/subscriber';
        }
        
        return this.mail.send(payload);
    }

    getBrandName() {
        return this.mail?.config?.brand?.name || 'Our Service';
    }

    isRealDriver() {
        return this.mail?.isRealDriver?.() || false;
    }

    getConfig() {
        return this.mail?.getConfig?.() || {};
    }
}

const subscriber = new Subscriber(); 
export { Subscriber };
export default subscriber;