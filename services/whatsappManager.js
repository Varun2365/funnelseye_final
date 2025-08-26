// D:\PRJ_YCT_Final\services\whatsappManager.js

// --- 1. Imports ---
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers, // <-- Added Browsers utility import
} = require('@whiskeysockets/baileys');
const pino = require('pino'); // Baileys' logger
const qrcode = require('qrcode-terminal'); // For displaying QR in console
const fs = require('fs').promises; // For file system operations (session deletion)
const path = require('path'); // For path manipulation
const { Boom } = require('@hapi/boom'); // For handling disconnect reasons gracefully
const mimeTypes = require('mime-types'); // For determining MIME types of local files
const aiService = require('./aiService');
const mongoose = require('mongoose');
const Lead = require('../schema/Lead');
const whatsappMessageSchema = require('../schema/whatsappMessageSchema');
const leadScoringService = require('./leadScoringService');
const { publishEvent } = require('./rabbitmqProducer');

// WhatsApp Message model
const WhatsAppMessage = mongoose.models.WhatsAppMessage || mongoose.model('WhatsAppMessage', whatsappMessageSchema);

// In-memory storage for active conversations and sequences
const activeConversations = new Map();
const messageSequences = new Map();
const escalationQueue = new Map();

/**
 * Enhanced WhatsApp Manager with Advanced Automation Features
 */
class WhatsAppManager {
    constructor() {
        this.automationRules = new Map();
        this.sentimentThresholds = {
            positive: 0.7,
            negative: 0.3,
            neutral: 0.5
        };
        this.escalationThresholds = {
            negativeSentiment: 0.6,
            multipleNegativeMessages: 3,
            urgentKeywords: ['urgent', 'emergency', 'help', 'problem', 'issue']
        };
        this.io = null; // Socket.IO instance
    }

    /**
     * Set Socket.IO instance for real-time updates
     */
    setIoInstance(io) {
        this.io = io;
        // console.log('[WhatsAppManager] Socket.IO instance set successfully');
    }

    /**
     * Initialize WhatsApp manager for a coach
     */
    async initializeCoach(coachId) {
        try {
            console.log(`[WhatsAppManager] Initializing WhatsApp manager for coach: ${coachId}`);
            
            // Load coach's automation rules
            await this.loadAutomationRules(coachId);
            
            // Initialize conversation tracking
            activeConversations.set(coachId, new Map());
            
            console.log(`[WhatsAppManager] WhatsApp manager initialized for coach: ${coachId}`);
            return true;
        } catch (error) {
            console.error(`[WhatsAppManager] Error initializing coach ${coachId}:`, error);
            return false;
        }
    }

    /**
     * Load automation rules for a coach
     */
    async loadAutomationRules(coachId) {
        try {
            // Load from database or configuration
            const rules = [
                {
                    id: 'welcome_sequence',
                    name: 'Welcome Sequence',
                    trigger: 'first_message',
                    steps: [
                        { delay: 0, message: 'Hi {{lead.name}}! Welcome to our community. How can I help you today?' },
                        { delay: 300000, message: 'Just checking in - did you have a chance to review our services?' },
                        { delay: 86400000, message: 'Hi {{lead.name}}! We\'d love to help you achieve your goals. Ready to get started?' }
                    ]
                },
                {
                    id: 'follow_up_sequence',
                    name: 'Follow-up Sequence',
                    trigger: 'lead_created',
                    steps: [
                        { delay: 0, message: 'Hi {{lead.name}}! Thanks for your interest. I\'ll be in touch soon with personalized information.' },
                        { delay: 3600000, message: 'Hi {{lead.name}}! I\'ve prepared some information for you. When would be a good time to discuss?' },
                        { delay: 86400000, message: 'Hi {{lead.name}}! I wanted to follow up and see if you have any questions about our services.' }
                    ]
                }
            ];
            
            this.automationRules.set(coachId, rules);
            console.log(`[WhatsAppManager] Loaded ${rules.length} automation rules for coach: ${coachId}`);
        } catch (error) {
            console.error(`[WhatsAppManager] Error loading automation rules for coach ${coachId}:`, error);
        }
    }

    /**
     * Handle incoming message with advanced automation
     */
    async handleIncomingMessage(coachId, msg) {
        try {
            console.log(`[WhatsAppManager] Processing incoming message for coach: ${coachId}`);
            
            // Extract message data
            const messageData = this.extractMessageData(msg);
            const phoneNumber = messageData.from;
            
            // Find or create lead
            const lead = await this.findOrCreateLead(coachId, phoneNumber, messageData);
            
            // Analyze message sentiment and intent
            const aiAnalysis = await this.analyzeMessage(messageData.content);
            
            // Update lead score based on interaction
            await this.updateLeadScore(lead._id, aiAnalysis);
            
            // Check for escalation triggers
            const shouldEscalate = await this.checkEscalationTriggers(lead._id, aiAnalysis, messageData);
            
            if (shouldEscalate) {
                await this.escalateToHuman(coachId, lead._id, messageData, aiAnalysis);
                return;
            }
            
            // Process automation rules
            await this.processAutomationRules(coachId, lead._id, messageData, aiAnalysis);
            
            // Save message to database
            await this.saveMessage(coachId, lead._id, messageData, 'inbound');
            
            console.log(`[WhatsAppManager] Successfully processed incoming message for lead: ${lead._id}`);
            
        } catch (error) {
            console.error(`[WhatsAppManager] Error handling incoming message:`, error);
        }
    }

    /**
     * Extract structured data from WhatsApp message
     */
    extractMessageData(msg) {
        const timestamp = msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000) : new Date();
        let content = '';
        let messageType = 'unknown';

        if (msg.message) {
            if (msg.message.conversation) {
                content = msg.message.conversation;
                messageType = 'text';
            } else if (msg.message.extendedTextMessage?.text) {
                content = msg.message.extendedTextMessage.text;
                messageType = 'text';
            } else if (msg.message.imageMessage) {
                content = msg.message.imageMessage.caption || 'Image message';
                messageType = 'image';
            } else if (msg.message.videoMessage) {
                content = msg.message.videoMessage.caption || 'Video message';
                messageType = 'video';
            } else if (msg.message.documentMessage) {
                content = msg.message.documentMessage.title || msg.message.documentMessage.fileName || 'Document message';
                messageType = 'document';
            } else if (msg.message.audioMessage) {
                content = 'Audio message';
                messageType = msg.message.audioMessage.ptt ? 'voice_note' : 'audio';
            }
        }

        return {
            from: msg.key?.remoteJid?.replace('@s.whatsapp.net', '') || msg.from,
            to: msg.key?.participant || msg.to,
            content: content,
            type: messageType,
            timestamp: timestamp,
            messageId: msg.key?.id || msg.messageId,
            mediaUrl: this.extractMediaUrl(msg),
            isGroup: msg.key?.remoteJid?.includes('@g.us') || false
        };
    }

    /**
     * Extract media URL from message
     */
    extractMediaUrl(msg) {
        if (msg.message?.imageMessage) {
            return msg.message.imageMessage.url || null;
        } else if (msg.message?.videoMessage) {
            return msg.message.videoMessage.url || null;
        } else if (msg.message?.documentMessage) {
            return msg.message.documentMessage.url || null;
        }
        return null;
    }

    /**
     * Find or create lead based on phone number
     */
    async findOrCreateLead(coachId, phoneNumber, messageData) {
        let lead = await Lead.findOne({ 
            phone: phoneNumber, 
            coachId: coachId 
        });

        if (!lead) {
            // Create new lead from WhatsApp message
            lead = await Lead.create({
                coachId: coachId,
                phone: phoneNumber,
                name: messageData.from || 'Unknown',
                source: 'WhatsApp',
                status: 'New',
                score: 10, // Initial score for WhatsApp interaction
                whatsappData: {
                    firstMessage: messageData.content,
                    firstMessageAt: messageData.timestamp,
                    isActive: true
                }
            });

            console.log(`[WhatsAppManager] Created new lead from WhatsApp: ${lead._id}`);
            
            // Trigger lead_created event
            await publishEvent('funnelseye_events', 'lead_created', {
                eventName: 'lead_created',
                payload: { leadId: lead._id, coachId },
                relatedDoc: { leadId: lead._id, coachId },
                timestamp: new Date().toISOString()
            });
        } else {
            // Update existing lead's WhatsApp activity
            lead.whatsappData = lead.whatsappData || {};
            lead.whatsappData.lastMessageAt = messageData.timestamp;
            lead.whatsappData.isActive = true;
            lead.whatsappData.messageCount = (lead.whatsappData.messageCount || 0) + 1;
            await lead.save();
        }

        return lead;
    }

    /**
     * Analyze message using AI for sentiment and intent
     */
    async analyzeMessage(content) {
        try {
            const analysis = await aiService.analyzeMessage({
                content: content,
                analysisType: 'sentiment_intent_urgency'
            });

            return {
                sentiment: analysis.sentiment || 'neutral',
                sentimentScore: analysis.sentimentScore || 0.5,
                intent: analysis.intent || 'general',
                urgency: analysis.urgency || 'low',
                keywords: analysis.keywords || [],
                confidence: analysis.confidence || 0.8
            };
        } catch (error) {
            console.error(`[WhatsAppManager] Error analyzing message:`, error);
            return {
                sentiment: 'neutral',
                sentimentScore: 0.5,
                intent: 'general',
                urgency: 'low',
                keywords: [],
                confidence: 0.5
            };
        }
    }

    /**
     * Update lead score based on message analysis
     */
    async updateLeadScore(leadId, analysis) {
        try {
            let scoreChange = 0;
            let explanation = [];

            // Score based on sentiment
            if (analysis.sentiment === 'positive') {
                scoreChange += 5;
                explanation.push('Positive message sentiment');
            } else if (analysis.sentiment === 'negative') {
                scoreChange -= 3;
                explanation.push('Negative message sentiment');
            }

            // Score based on intent
            if (analysis.intent === 'purchase' || analysis.intent === 'booking') {
                scoreChange += 10;
                explanation.push('High purchase intent');
            } else if (analysis.intent === 'information') {
                scoreChange += 3;
                explanation.push('Information seeking');
            }

            // Score based on urgency
            if (analysis.urgency === 'high') {
                scoreChange += 8;
                explanation.push('High urgency');
            }

            // Update lead score
            await leadScoringService.updateLeadScore(leadId, 'whatsapp_interaction', scoreChange, explanation);

        } catch (error) {
            console.error(`[WhatsAppManager] Error updating lead score:`, error);
        }
    }

    /**
     * Check if message should be escalated to human
     */
    async checkEscalationTriggers(leadId, analysis, messageData) {
        try {
            // Check sentiment threshold
            if (analysis.sentiment === 'negative' && analysis.sentimentScore < this.escalationThresholds.negativeSentiment) {
                return true;
            }

            // Check for urgent keywords
            const urgentKeywordsFound = this.escalationThresholds.urgentKeywords.some(keyword => 
                messageData.content.toLowerCase().includes(keyword)
            );

            if (urgentKeywordsFound) {
                return true;
            }

            // Check message count for negative sentiment
            const lead = await Lead.findById(leadId);
            if (lead.whatsappData?.negativeMessageCount >= this.escalationThresholds.multipleNegativeMessages) {
                return true;
            }

            return false;
        } catch (error) {
            console.error(`[WhatsAppManager] Error checking escalation triggers:`, error);
            return false;
        }
    }

    /**
     * Escalate conversation to human coach
     */
    async escalateToHuman(coachId, leadId, messageData, analysis) {
        try {
            console.log(`[WhatsAppManager] Escalating conversation to human for lead: ${leadId}`);

            // Add to escalation queue
            escalationQueue.set(leadId, {
                coachId: coachId,
                leadId: leadId,
                reason: analysis.sentiment === 'negative' ? 'Negative sentiment' : 'Urgent keywords detected',
                timestamp: new Date(),
                messageData: messageData,
                analysis: analysis
            });

            // Trigger escalation event
            await publishEvent('funnelseye_events', 'whatsapp_escalation', {
                eventName: 'whatsapp_escalation',
                payload: { 
                    leadId: leadId, 
                    coachId: coachId,
                    reason: 'Automated escalation triggered',
                    analysis: analysis
                },
                relatedDoc: { leadId: leadId, coachId: coachId },
                timestamp: new Date().toISOString()
            });

            // Send escalation notification to coach
            await this.sendEscalationNotification(coachId, leadId, messageData, analysis);

        } catch (error) {
            console.error(`[WhatsAppManager] Error escalating to human:`, error);
        }
    }

    /**
     * Send escalation notification to coach
     */
    async sendEscalationNotification(coachId, leadId, messageData, analysis) {
        try {
            // This would integrate with your notification system
            console.log(`[WhatsAppManager] Sending escalation notification to coach: ${coachId}`);
            
            // You can implement email, SMS, or in-app notifications here
            // For now, we'll just log it
            
        } catch (error) {
            console.error(`[WhatsAppManager] Error sending escalation notification:`, error);
        }
    }

    /**
     * Process automation rules for incoming message
     */
    async processAutomationRules(coachId, leadId, messageData, analysis) {
        try {
            const rules = this.automationRules.get(coachId) || [];
            
            for (const rule of rules) {
                if (this.shouldTriggerRule(rule, messageData, analysis)) {
                    await this.executeRule(rule, coachId, leadId, messageData);
                }
            }
        } catch (error) {
            console.error(`[WhatsAppManager] Error processing automation rules:`, error);
        }
    }

    /**
     * Check if rule should be triggered
     */
    shouldTriggerRule(rule, messageData, analysis) {
        switch (rule.trigger) {
            case 'first_message':
                return messageData.isFirstMessage;
            case 'negative_sentiment':
                return analysis.sentiment === 'negative';
            case 'urgent_message':
                return analysis.urgency === 'high';
            case 'specific_keywords':
                return rule.keywords?.some(keyword => 
                    messageData.content.toLowerCase().includes(keyword)
                );
            default:
                return false;
        }
    }

    /**
     * Execute automation rule
     */
    async executeRule(rule, coachId, leadId, messageData) {
        try {
            console.log(`[WhatsAppManager] Executing rule: ${rule.name} for lead: ${leadId}`);

            for (const step of rule.steps) {
                // Schedule message with delay
                setTimeout(async () => {
                    await this.sendAutomatedMessage(coachId, leadId, step.message, messageData);
                }, step.delay);
            }

        } catch (error) {
            console.error(`[WhatsAppManager] Error executing rule:`, error);
        }
    }

    /**
     * Send automated message
     */
    async sendAutomatedMessage(coachId, leadId, messageTemplate, originalMessage) {
        try {
            // Replace template variables
            const lead = await Lead.findById(leadId);
            const personalizedMessage = this.replaceTemplateVariables(messageTemplate, lead, originalMessage);

            // Send message via WhatsApp service
            // await this.sendWhatsAppMessage(coachId, lead.phone, personalizedMessage);

            // Save message to database
            await this.saveMessage(coachId, leadId, {
                content: personalizedMessage,
                type: 'text',
                timestamp: new Date(),
                messageId: `auto_${Date.now()}`,
                isAutomated: true
            }, 'outbound');

            console.log(`[WhatsAppManager] Sent automated message to lead: ${leadId}`);

        } catch (error) {
            console.error(`[WhatsAppManager] Error sending automated message:`, error);
        }
    }

    /**
     * Replace template variables in message
     */
    replaceTemplateVariables(template, lead, originalMessage) {
        return template
            .replace('{{lead.name}}', lead.name || 'there')
            .replace('{{lead.firstName}}', lead.name?.split(' ')[0] || 'there')
            .replace('{{coach.name}}', 'Your Coach')
            .replace('{{company.name}}', 'Our Company');
    }

    /**
     * Save message to database
     */
    async saveMessage(coachId, leadId, messageData, direction) {
        try {
            const message = new WhatsAppMessage({
                coach: coachId,
                lead: leadId,
                messageId: messageData.messageId,
                from: direction === 'inbound' ? messageData.from : messageData.to,
                to: direction === 'inbound' ? messageData.to : messageData.from,
                content: messageData.content,
                direction: direction,
                timestamp: messageData.timestamp,
                mediaUrl: messageData.mediaUrl,
                type: messageData.type,
                isAutomated: messageData.isAutomated || false
            });

            await message.save();
            console.log(`[WhatsAppManager] Saved ${direction} message to database`);

        } catch (error) {
            console.error(`[WhatsAppManager] Error saving message:`, error);
        }
    }

    /**
     * Get conversation history for a lead
     */
    async getConversationHistory(coachId, leadId, limit = 50) {
        try {
            const messages = await WhatsAppMessage.find({
                coach: coachId,
                lead: leadId
            })
            .sort({ timestamp: -1 })
            .limit(limit);

            return messages.reverse(); // Return in chronological order
        } catch (error) {
            console.error(`[WhatsAppManager] Error getting conversation history:`, error);
            return [];
        }
    }

    /**
     * Get active conversations for a coach
     */
    async getActiveConversations(coachId) {
        try {
            const activeLeads = await Lead.find({
                coachId: coachId,
                'whatsappData.isActive': true
            }).populate('whatsappData');

            return activeLeads.map(lead => ({
                leadId: lead._id,
                name: lead.name,
                phone: lead.phone,
                lastMessageAt: lead.whatsappData?.lastMessageAt,
                messageCount: lead.whatsappData?.messageCount || 0,
                status: lead.status,
                score: lead.score
            }));
        } catch (error) {
            console.error(`[WhatsAppManager] Error getting active conversations:`, error);
            return [];
        }
    }

    /**
     * Get escalation queue for a coach
     */
    async getEscalationQueue(coachId) {
        try {
            const escalations = [];
            
            for (const [leadId, escalation] of escalationQueue.entries()) {
                if (escalation.coachId === coachId) {
                    escalations.push({
                        leadId: leadId,
                        reason: escalation.reason,
                        timestamp: escalation.timestamp,
                        messageData: escalation.messageData,
                        analysis: escalation.analysis
                    });
                }
            }

            return escalations;
        } catch (error) {
            console.error(`[WhatsAppManager] Error getting escalation queue:`, error);
            return [];
        }
    }

    /**
     * Mark escalation as resolved
     */
    async resolveEscalation(leadId) {
        try {
            escalationQueue.delete(leadId);
            console.log(`[WhatsAppManager] Resolved escalation for lead: ${leadId}`);
        } catch (error) {
            console.error(`[WhatsAppManager] Error resolving escalation:`, error);
        }
    }
}

// Export singleton instance
module.exports = new WhatsAppManager();