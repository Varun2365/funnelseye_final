# 🌱 Nurturing Sequence System

## Overview

The Nurturing Sequence System is a comprehensive automation platform that allows coaches to create, manage, and automatically execute multi-step engagement sequences for leads. When a new lead is created through a funnel, the system automatically assigns and executes the appropriate nurturing sequence based on trigger conditions.

## 🚀 Key Features

### **Automatic Assignment**
- **Funnel Integration**: Sequences are automatically assigned to leads based on funnel assignments
- **Smart Matching**: Uses trigger conditions (lead score, source, status, temperature) to find the best sequence
- **Instant Execution**: Starts sequences immediately when leads are created

### **Flexible Configuration**
- **Multiple Categories**: Warm leads, cold leads, objection handling, reactivation, follow-up, custom
- **Customizable Steps**: Each step can have different actions, delays, and conditions
- **Trigger Conditions**: Fine-tune when sequences should be assigned

### **Action Types**
- **WhatsApp Messages**: Send personalized messages with templates
- **Emails**: Automated email sequences
- **SMS**: Text message automation
- **Tasks**: Create follow-up tasks for coaches
- **Lead Scoring**: Update lead scores automatically
- **Tags**: Add lead tags for categorization
- **Appointments**: Schedule consultation calls
- **Notifications**: Internal coach notifications
- **Delays**: Wait periods between steps

### **Management Features**
- **Duplicate Sequences**: Copy and modify existing sequences
- **Bulk Operations**: Assign multiple sequences to multiple funnels
- **Performance Tracking**: Monitor sequence effectiveness and conversion rates
- **Testing**: Dry-run sequences before activation

## 📋 API Endpoints

### **CRUD Operations**
- `POST /api/nurturing-sequences` - Create new sequence
- `GET /api/nurturing-sequences` - Get all sequences
- `GET /api/nurturing-sequences/:id` - Get single sequence
- `PUT /api/nurturing-sequences/:id` - Update sequence
- `DELETE /api/nurturing-sequences/:id` - Delete sequence

### **Sequence Management**
- `POST /api/nurturing-sequences/:id/duplicate` - Duplicate sequence
- `PUT /api/nurturing-sequences/:id/toggle` - Toggle active status
- `GET /api/nurturing-sequences/:id/stats` - Get execution statistics
- `POST /api/nurturing-sequences/:id/test` - Test sequence execution

### **Funnel Assignments**
- `POST /api/nurturing-sequences/assign-to-funnel` - Assign to funnel
- `POST /api/nurturing-sequences/remove-from-funnel` - Remove from funnel
- `POST /api/nurturing-sequences/bulk-assign` - Bulk assign operations
- `GET /api/nurturing-sequences/:id/funnel-assignments` - Get funnel assignments

### **Categories**
- `GET /api/nurturing-sequences/category/:category` - Get sequences by category

## 🎯 How It Works

### **1. Sequence Creation**
```javascript
const sequence = {
    name: "Warm Lead Welcome",
    description: "5-step sequence for warm leads",
    category: "warm_lead",
    triggerConditions: {
        leadScore: { min: 30, max: 70 },
        leadSource: ["Web Form", "Lead Magnet"],
        leadStatus: ["New", "Contacted"],
        leadTemperature: ["Warm", "Hot"]
    },
    steps: [
        {
            stepNumber: 1,
            name: "Welcome Message",
            actionType: "send_whatsapp_message",
            actionConfig: {
                message: "Hi {{lead.name}}! Welcome to our fitness program!"
            },
            delayDays: 0,
            delayHours: 0
        },
        // ... more steps
    ]
};
```

### **2. Funnel Assignment**
```javascript
// Assign sequence to funnel
await fetch('/api/nurturing-sequences/assign-to-funnel', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
        sequenceId: 'sequence_id',
        funnelId: 'funnel_id'
    })
});
```

### **3. Automatic Execution**
When a new lead is created through a funnel:
1. System checks for assigned nurturing sequences
2. Evaluates trigger conditions to find the best match
3. Automatically assigns the sequence to the lead
4. Executes the first step immediately (if no delay)
5. Schedules subsequent steps based on delays
6. Tracks progress and execution status

### **4. Step Execution**
Each step is executed through the automation system:
- Actions are published to RabbitMQ
- Workers process the actions (send messages, create tasks, etc.)
- Progress is tracked in the database
- Failed steps can be retried automatically

## 🔧 Configuration Options

### **Trigger Conditions**
- **Lead Score Range**: Min/max score thresholds
- **Lead Sources**: Specific lead sources (Web Form, Social Media, etc.)
- **Lead Status**: Current lead status (New, Contacted, etc.)
- **Lead Temperature**: Lead temperature (Cold, Warm, Hot)

### **Sequence Settings**
- **Max Retries**: Number of retry attempts for failed steps
- **Retry Delay**: Time between retry attempts
- **Stop on Conversion**: Whether to stop sequence when lead converts
- **Manual Advance**: Allow coaches to manually advance steps

### **Step Configuration**
- **Delays**: Days and hours between steps
- **Conditions**: Additional conditions for step execution
- **Action Config**: Specific configuration for each action type
- **Active Status**: Enable/disable individual steps

## 📊 Monitoring & Analytics

### **Sequence Statistics**
- Total leads assigned
- Active leads in sequence
- Completed leads
- Conversion rate
- Average completion time

### **Execution Logs**
- Step execution status
- Success/failure rates
- Execution timing
- Error messages
- Retry attempts

### **Performance Metrics**
- Sequence effectiveness
- Step completion rates
- Lead engagement levels
- Conversion tracking

## 🎨 UI Integration

### **Coach Dashboard Sidebar**
Add this section to your sidebar:
```
🌱 Nurturing Sequences
├── All Sequences
├── Create New
├── Categories
├── Funnel Assignments
└── Analytics
```

### **Sequence Management Interface**
- **Sequence Builder**: Drag-and-drop step creation
- **Template Library**: Pre-built sequence templates
- **Funnel Assignment**: Visual funnel-to-sequence mapping
- **Performance Dashboard**: Real-time sequence analytics

## 🚨 Best Practices

### **Sequence Design**
1. **Start Simple**: Begin with 3-5 step sequences
2. **Personalize**: Use lead data variables in messages
3. **Test Timing**: Optimize delays based on lead behavior
4. **Monitor Performance**: Track conversion rates and adjust

### **Content Strategy**
1. **Value First**: Provide value before asking for commitment
2. **Social Proof**: Include testimonials and success stories
3. **Clear CTAs**: Make next steps obvious and easy
4. **Objection Handling**: Address common concerns proactively

### **Automation Rules**
1. **Conditional Logic**: Use trigger conditions wisely
2. **Fallback Sequences**: Have default sequences for edge cases
3. **Human Touch**: Include manual intervention points
4. **Regular Review**: Monitor and update sequences regularly

## 🔍 Troubleshooting

### **Common Issues**
- **Sequences Not Starting**: Check funnel assignments and trigger conditions
- **Steps Not Executing**: Verify action configurations and automation workers
- **Poor Performance**: Review timing, content, and lead targeting
- **High Failure Rates**: Check action configurations and external service status

### **Debug Tools**
- **Sequence Testing**: Use the test endpoint to simulate execution
- **Execution Logs**: Review detailed step-by-step logs
- **Performance Analytics**: Monitor sequence effectiveness metrics
- **Lead Tracking**: Follow individual lead progression through sequences

## 📚 Examples

See `examples/nurturing_sequence_examples.js` for comprehensive examples including:
- Warm lead welcome sequences
- Cold lead warming sequences
- Objection handling sequences
- Reactivation sequences
- Complete workflow examples

## 🔗 Integration Points

### **Existing Systems**
- **Lead Management**: Automatic sequence assignment
- **Automation Engine**: Step execution and action processing
- **WhatsApp Service**: Message delivery
- **Task Management**: Follow-up task creation
- **Analytics**: Performance tracking and reporting

### **External Services**
- **RabbitMQ**: Message queuing and processing
- **MongoDB**: Data storage and retrieval
- **Socket.IO**: Real-time updates and notifications

## 🚀 Getting Started

1. **Create Your First Sequence**
   ```javascript
   // Use the examples in nurturing_sequence_examples.js
   // Start with a simple 3-step welcome sequence
   ```

2. **Assign to a Funnel**
   ```javascript
   // Link your sequence to an existing funnel
   // New leads will automatically get the sequence
   ```

3. **Monitor Performance**
   ```javascript
   // Check sequence statistics regularly
   // Adjust timing and content based on results
   ```

4. **Scale and Optimize**
   ```javascript
   // Create sequences for different lead types
   // A/B test different approaches
   // Build a comprehensive nurturing strategy
   ```

## 📞 Support

For questions or issues with the nurturing sequence system:
- Check the execution logs for detailed error information
- Review the automation worker status
- Verify sequence configurations and funnel assignments
- Test sequences using the test endpoint before production use

---

**The Nurturing Sequence System transforms manual lead follow-up into automated, scalable, and effective engagement workflows that drive conversions and build lasting relationships with your leads.**
