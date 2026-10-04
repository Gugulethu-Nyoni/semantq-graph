import { MailService } from '@semantq/mail';

/**
 * BlogNotification - Email service for BlogNotification related emails.
 */
class BlogNotification { 
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
            console.error('Failed to initialize BlogNotification:', error);
            this.mail = new MailService({
                email: { driver: 'log' },
                brand: { name: 'Our Service' }
            });
            this.initialized = true;
        }
        
        return this;
    }

    /**
     * Send BlogNotification email
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
    async sendBlogNotification(payload) {
        // Ensure template is set
        if (!payload.template) {
            payload.template = 'blognotification/blognotification';
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

const blogNotification = new BlogNotification(); 
export { BlogNotification };
export default blogNotification;