const nodemailer = require('nodemailer');
const { EmailConfig } = require('../schemas');
const logger = require('../../utils/logger');

class EmailService {
    constructor() {
        this.transporters = new Map();
    }

    async createTransporter(configId) {
        try {
            const config = await EmailConfig.findById(configId);
            if (!config) {
                throw new Error('Email configuration not found');
            }

            const transporter = nodemailer.createTransporter({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure,
                auth: {
                    user: config.smtp.auth.user,
                    pass: config.smtp.auth.pass
                }
            });

            // Verify connection
            await transporter.verify();

            this.transporters.set(configId, transporter);

            return {
                success: true,
                message: 'Email transporter created successfully',
                config
            };

        } catch (error) {
            logger.error(`[EmailService] Error creating transporter for config ${configId}:`, error);
            throw error;
        }
    }

    async sendEmail(configId, emailData) {
        try {
            const config = await EmailConfig.findById(configId);
            if (!config) {
                throw new Error('Email configuration not found');
            }

            if (!config.isActive) {
                throw new Error('Email configuration is not active');
            }

            // Reset daily count if needed
            await config.resetDailyCount();

            // Check daily limit
            if (!config.canSendEmail()) {
                throw new Error('Daily email limit exceeded');
            }

            // Get or create transporter
            let transporter = this.transporters.get(configId);
            if (!transporter) {
                await this.createTransporter(configId);
                transporter = this.transporters.get(configId);
            }

            const mailOptions = {
                from: `"${config.from.name}" <${config.from.email}>`,
                to: emailData.to,
                subject: emailData.subject,
                text: emailData.text,
                html: emailData.html
            };

            // Add reply-to if configured
            if (config.replyTo) {
                mailOptions.replyTo = `"${config.replyTo.name}" <${config.replyTo.email}>`;
            }

            // Add tracking headers if enabled
            if (config.settings.trackOpens) {
                mailOptions.headers = {
                    'X-Track-Opens': 'true'
                };
            }

            if (config.settings.trackClicks) {
                mailOptions.headers = {
                    ...mailOptions.headers,
                    'X-Track-Clicks': 'true'
                };
            }

            if (config.settings.unsubscribeHeader) {
                mailOptions.headers = {
                    ...mailOptions.headers,
                    'List-Unsubscribe': `<mailto:${config.from.email}?subject=unsubscribe>`
                };
            }

            // Send email
            const result = await transporter.sendMail(mailOptions);

            // Increment sent count
            await config.incrementSentCount();

            // Save email to database
            await this.saveEmail(configId, emailData, result);

            return {
                success: true,
                messageId: result.messageId,
                status: 'sent'
            };

        } catch (error) {
            logger.error(`[EmailService] Error sending email:`, error);
            throw error;
        }
    }

    async saveEmail(configId, emailData, result) {
        try {
            const EmailMessage = require('../schemas/EmailMessage');
            
            const messageData = {
                configId,
                to: emailData.to,
                subject: emailData.subject,
                content: {
                    text: emailData.text,
                    html: emailData.html
                },
                messageId: result.messageId,
                status: 'sent',
                statusTimestamp: new Date()
            };

            await EmailMessage.create(messageData);

        } catch (error) {
            logger.error(`[EmailService] Error saving email:`, error);
        }
    }

    async sendBulkEmail(configId, emails) {
        try {
            const results = [];
            const errors = [];

            for (const email of emails) {
                try {
                    const result = await this.sendEmail(configId, email);
                    results.push(result);
                } catch (error) {
                    errors.push({
                        email: email.to,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                results,
                errors,
                summary: {
                    total: emails.length,
                    sent: results.length,
                    failed: errors.length
                }
            };

        } catch (error) {
            logger.error(`[EmailService] Error sending bulk email:`, error);
            throw error;
        }
    }

    async sendTemplateEmail(configId, template, variables, emailData) {
        try {
            let subject = template.subject;
            let text = template.text;
            let html = template.html;

            // Replace variables
            for (const [key, value] of Object.entries(variables)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                subject = subject.replace(regex, value);
                text = text.replace(regex, value);
                html = html.replace(regex, value);
            }

            const finalEmailData = {
                ...emailData,
                subject,
                text,
                html
            };

            return await this.sendEmail(configId, finalEmailData);

        } catch (error) {
            logger.error(`[EmailService] Error sending template email:`, error);
            throw error;
        }
    }

    async testConnection(configId) {
        try {
            const config = await EmailConfig.findById(configId);
            if (!config) {
                throw new Error('Email configuration not found');
            }

            const transporter = nodemailer.createTransporter({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure,
                auth: {
                    user: config.smtp.auth.user,
                    pass: config.smtp.auth.pass
                }
            });

            await transporter.verify();

            return {
                success: true,
                message: 'Connection test successful'
            };

        } catch (error) {
            logger.error(`[EmailService] Error testing connection:`, error);
            throw error;
        }
    }

    async getProviderConfig(provider) {
        const configs = {
            gmail: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false
            },
            outlook: {
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: false
            },
            yahoo: {
                host: 'smtp.mail.yahoo.com',
                port: 587,
                secure: false
            },
            sendgrid: {
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false
            },
            mailgun: {
                host: 'smtp.mailgun.org',
                port: 587,
                secure: false
            },
            'aws-ses': {
                host: 'email-smtp.us-east-1.amazonaws.com',
                port: 587,
                secure: false
            }
        };

        return configs[provider] || null;
    }

    async createProviderConfig(provider, credentials) {
        try {
            const baseConfig = await this.getProviderConfig(provider);
            if (!baseConfig) {
                throw new Error('Unsupported email provider');
            }

            return {
                ...baseConfig,
                auth: {
                    user: credentials.user,
                    pass: credentials.pass
                }
            };

        } catch (error) {
            logger.error(`[EmailService] Error creating provider config:`, error);
            throw error;
        }
    }

    async getConfigStats(configId) {
        try {
            const config = await EmailConfig.findById(configId);
            if (!config) {
                throw new Error('Email configuration not found');
            }

            const EmailMessage = require('../schemas/EmailMessage');
            
            const stats = await EmailMessage.aggregate([
                { $match: { configId: config._id } },
                {
                    $group: {
                        _id: null,
                        totalEmails: { $sum: 1 },
                        sentEmails: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                        failedEmails: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
                    }
                }
            ]);

            return {
                config,
                stats: stats[0] || {
                    totalEmails: 0,
                    sentEmails: 0,
                    failedEmails: 0
                }
            };

        } catch (error) {
            logger.error(`[EmailService] Error getting config stats:`, error);
            throw error;
        }
    }

    async deleteTransporter(configId) {
        try {
            const transporter = this.transporters.get(configId);
            if (transporter) {
                transporter.close();
                this.transporters.delete(configId);
            }

            return { success: true, message: 'Transporter deleted successfully' };

        } catch (error) {
            logger.error(`[EmailService] Error deleting transporter:`, error);
            throw error;
        }
    }
}

module.exports = new EmailService();
