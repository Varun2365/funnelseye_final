// Examples of how to create and use nurturing sequences
// This file demonstrates the complete nurturing sequence workflow

// ===== EXAMPLE 1: WARM LEAD SEQUENCE =====
const warmLeadSequence = {
    name: "Warm Lead Welcome Sequence",
    description: "5-step sequence for leads who show initial interest",
    category: "warm_lead",
    triggerConditions: {
        leadScore: { min: 30, max: 70 },
        leadSource: ["Web Form", "Lead Magnet", "Social Media"],
        leadStatus: ["New", "Contacted"],
        leadTemperature: ["Warm", "Hot"]
    },
    settings: {
        maxRetries: 3,
        retryDelayDays: 2,
        stopOnConversion: true,
        allowManualAdvance: true
    },
    steps: [
        {
            stepNumber: 1,
            name: "Immediate Welcome",
            description: "Send welcome message within 5 minutes",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "Hi {{lead.name}}! 👋 Thanks for your interest in our fitness program. I'm excited to help you on your journey!",
                template: "welcome_message"
            },
            delayDays: 0,
            delayHours: 0
        },
        {
            stepNumber: 2,
            name: "Value Proposition",
            description: "Send value proposition after 1 day",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, here's what makes our program special:\n\n✅ Personalized workout plans\n✅ Nutrition guidance\n✅ 24/7 support\n✅ Proven results\n\nWould you like to learn more?",
                mediaUrl: "https://example.com/program-overview.pdf"
            },
            delayDays: 1,
            delayHours: 0
        },
        {
            stepNumber: 3,
            name: "Social Proof",
            description: "Share success stories after 3 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, check out what our clients are saying:\n\n💪 Sarah lost 25kg in 6 months\n💪 Mike gained 10kg muscle\n💪 Lisa improved her energy levels\n\nReady to join them?",
                mediaUrl: "https://example.com/testimonials.jpg"
            },
            delayDays: 3,
            delayHours: 0
        },
        {
            stepNumber: 4,
            name: "Special Offer",
            description: "Present limited-time offer after 5 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I have a special offer for you! 🎉\n\nFirst 7 days for just $7 (usually $97)\n\nThis offer expires in 48 hours. Want to get started?",
                callToAction: "Start My 7-Day Trial"
            },
            delayDays: 5,
            delayHours: 0
        },
        {
            stepNumber: 5,
            name: "Final Follow-up",
            description: "Last attempt to engage after 7 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I haven't heard from you yet. I want to make sure you're getting the support you need.\n\nWhat's holding you back from starting your fitness journey? I'm here to help!",
                followUpType: "final_attempt"
            },
            delayDays: 7,
            delayHours: 0
        }
    ]
};

// ===== EXAMPLE 2: COLD LEAD SEQUENCE =====
const coldLeadSequence = {
    name: "Cold Lead Warming Sequence",
    description: "7-step sequence to warm up cold leads",
    category: "cold_lead",
    triggerConditions: {
        leadScore: { min: 0, max: 30 },
        leadSource: ["Cold Outreach", "Referral", "Paid Ads"],
        leadStatus: ["New"],
        leadTemperature: ["Cold"]
    },
    settings: {
        maxRetries: 2,
        retryDelayDays: 3,
        stopOnConversion: false,
        allowManualAdvance: true
    },
    steps: [
        {
            stepNumber: 1,
            name: "Introduction",
            description: "Gentle introduction to build rapport",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "Hi {{lead.name}}, I hope this message finds you well! I'm reaching out because I believe I can help you achieve your fitness goals.",
                tone: "friendly"
            },
            delayDays: 0,
            delayHours: 0
        },
        {
            stepNumber: 2,
            name: "Educational Content",
            description: "Share valuable fitness tips after 2 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, here's a quick fitness tip: Did you know that walking just 10,000 steps daily can burn up to 500 calories? 🚶‍♂️\n\nWhat's your current activity level?",
                includeQuestion: true
            },
            delayDays: 2,
            delayHours: 0
        },
        {
            stepNumber: 3,
            name: "Free Resource",
            description: "Offer free resource after 4 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I've created a free guide: '5 Simple Steps to Start Your Fitness Journey'\n\nWould you like me to send it to you? It's packed with actionable tips! 📚",
                offerType: "free_resource"
            },
            delayDays: 4,
            delayHours: 0
        },
        {
            stepNumber: 4,
            name: "Personalized Message",
            description: "Send personalized message after 6 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I noticed you're interested in fitness. What's your biggest challenge right now?\n\nIs it:\n• Finding time to exercise?\n• Not knowing where to start?\n• Staying motivated?\n\nI'd love to help!",
                includeMultipleChoice: true
            },
            delayDays: 6,
            delayHours: 0
        },
        {
            stepNumber: 5,
            name: "Success Story",
            description: "Share relevant success story after 8 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, here's a story that might inspire you:\n\nJohn was in the same situation as you - busy schedule, no fitness experience. In just 3 months, he lost 15kg and gained confidence!\n\nWhat would achieving your fitness goals mean to you?",
                storyType: "relevant_success"
            },
            delayDays: 8,
            delayHours: 0
        },
        {
            stepNumber: 6,
            name: "Invitation",
            description: "Invite to free consultation after 10 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I'd love to have a quick 15-minute call to understand your goals better. No pressure, just a friendly chat about fitness.\n\nWould you be interested? I'm available this week! 📞",
                callToAction: "Schedule Free Call"
            },
            delayDays: 10,
            delayHours: 0
        },
        {
            stepNumber: 7,
            name: "Final Touch",
            description: "Final gentle reminder after 12 days",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I hope you're doing well! I'm here whenever you're ready to start your fitness journey.\n\nRemember, every expert was once a beginner. The best time to start is now! 💪",
                tone: "encouraging"
            },
            delayDays: 12,
            delayHours: 0
        }
    ]
};

// ===== EXAMPLE 3: OBJECTION HANDLING SEQUENCE =====
const objectionHandlingSequence = {
    name: "Objection Handling Sequence",
    description: "4-step sequence to address common objections",
    category: "objection_handling",
    triggerConditions: {
        leadScore: { min: 50, max: 100 },
        leadStatus: ["Objection", "Hesitant"],
        leadTemperature: ["Warm", "Hot"]
    },
    settings: {
        maxRetries: 2,
        retryDelayDays: 1,
        stopOnConversion: true,
        allowManualAdvance: true
    },
    steps: [
        {
            stepNumber: 1,
            name: "Acknowledge Objection",
            description: "Acknowledge and validate their concern",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I completely understand your concern about {{objection}}. It's a valid point that many people have.",
                tone: "empathetic"
            },
            delayDays: 0,
            delayHours: 0
        },
        {
            stepNumber: 2,
            name: "Address Objection",
            description: "Provide solution to their objection",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "Here's how we address {{objection}}:\n\n✅ Flexible scheduling options\n✅ Money-back guarantee\n✅ Ongoing support\n\nWould you like me to explain more?",
                includeSolution: true
            },
            delayDays: 1,
            delayHours: 0
        },
        {
            stepNumber: 3,
            name: "Social Proof",
            description: "Show how others overcame similar objections",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, here's what others with the same concern said:\n\n'{{testimonial}}'\n\nThey're now seeing amazing results!",
                includeTestimonial: true
            },
            delayDays: 2,
            delayHours: 0
        },
        {
            stepNumber: 4,
            name: "Call to Action",
            description: "Gentle push to take action",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I believe we can help you overcome {{objection}} and achieve your goals.\n\nWhat do you say we give it a try? I'm here to support you every step of the way!",
                callToAction: "Let's Get Started"
            },
            delayDays: 3,
            delayHours: 0
        }
    ]
};

// ===== EXAMPLE 4: REACTIVATION SEQUENCE =====
const reactivationSequence = {
    name: "Lead Reactivation Sequence",
    description: "3-step sequence to reactivate inactive leads",
    category: "reactivation",
    triggerConditions: {
        leadScore: { min: 20, max: 80 },
        leadStatus: ["Inactive", "Unresponsive"],
        leadTemperature: ["Cold", "Warm"]
    },
    settings: {
        maxRetries: 1,
        retryDelayDays: 5,
        stopOnConversion: true,
        allowManualAdvance: false
    },
    steps: [
        {
            stepNumber: 1,
            name: "Reconnection",
            description: "Reconnect with a friendly message",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}! 👋 It's been a while since we last connected. I hope you're doing great!\n\nI was thinking about your fitness goals and wanted to check in.",
                tone: "friendly"
            },
            delayDays: 0,
            delayHours: 0
        },
        {
            stepNumber: 2,
            name: "New Offer",
            description: "Present new or updated offer",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I have some exciting news! We've updated our program with new features:\n\n🆕 AI-powered workout plans\n🆕 Nutrition tracking app\n🆕 Community support group\n\nInterested in learning more?",
                offerType: "new_features"
            },
            delayDays: 3,
            delayHours: 0
        },
        {
            stepNumber: 3,
            name: "Final Attempt",
            description: "Last attempt to re-engage",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "{{lead.name}}, I want to make sure you're getting the support you need.\n\nIf you're still interested in your fitness goals, I'm here to help. If not, just let me know and I'll stop reaching out.\n\nWhat do you think?",
                callToAction: "Let's Talk"
            },
            delayDays: 5,
            delayHours: 0
        }
    ]
};

// ===== API USAGE EXAMPLES =====

// Create a nurturing sequence
const createSequenceExample = async () => {
    try {
        const response = await fetch('/api/nurturing-sequences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(warmLeadSequence)
        });
        
        const result = await response.json();
        console.log('Sequence created:', result);
        return result.data._id;
    } catch (error) {
        console.error('Error creating sequence:', error);
    }
};

// Assign sequence to funnel
const assignToFunnelExample = async (sequenceId, funnelId) => {
    try {
        const response = await fetch('/api/nurturing-sequences/assign-to-funnel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sequenceId, funnelId })
        });
        
        const result = await response.json();
        console.log('Sequence assigned to funnel:', result);
    } catch (error) {
        console.error('Error assigning sequence:', error);
    }
};

// Test sequence execution
const testSequenceExample = async (sequenceId, leadId) => {
    try {
        const response = await fetch(`/api/nurturing-sequences/${sequenceId}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ leadId })
        });
        
        const result = await response.json();
        console.log('Sequence test result:', result);
    } catch (error) {
        console.error('Error testing sequence:', error);
    }
};

// Get sequence statistics
const getSequenceStatsExample = async (sequenceId) => {
    try {
        const response = await fetch(`/api/nurturing-sequences/${sequenceId}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        console.log('Sequence stats:', result);
    } catch (error) {
        console.error('Error getting stats:', error);
    }
};

// ===== COMPLETE WORKFLOW EXAMPLE =====

const completeWorkflowExample = async () => {
    console.log('🚀 Starting Nurturing Sequence Workflow...');
    
    // 1. Create the sequence
    console.log('📝 Creating nurturing sequence...');
    const sequenceId = await createSequenceExample();
    
    if (!sequenceId) {
        console.error('Failed to create sequence');
        return;
    }
    
    // 2. Assign to funnel
    console.log('🔗 Assigning sequence to funnel...');
    const funnelId = 'your_funnel_id_here';
    await assignToFunnelExample(sequenceId, funnelId);
    
    // 3. Test the sequence
    console.log('🧪 Testing sequence execution...');
    const leadId = 'your_lead_id_here';
    await testSequenceExample(sequenceId, leadId);
    
    // 4. Monitor performance
    console.log('📊 Getting sequence statistics...');
    await getSequenceStatsExample(sequenceId);
    
    console.log('✅ Nurturing sequence workflow completed!');
};

// Export examples for use in other files
module.exports = {
    warmLeadSequence,
    coldLeadSequence,
    objectionHandlingSequence,
    reactivationSequence,
    createSequenceExample,
    assignToFunnelExample,
    testSequenceExample,
    getSequenceStatsExample,
    completeWorkflowExample
};
