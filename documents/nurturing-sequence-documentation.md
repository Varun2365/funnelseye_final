# Nurturing Sequence System Documentation

## Overview

The Nurturing Sequence System is a comprehensive lead automation platform that allows coaches to create, manage, and execute automated follow-up sequences for their leads. The system supports multiple types of nurturing sequences, automatic assignment based on funnel triggers, and detailed analytics.

## Current Status

### ✅ Implemented Features

1. **Complete CRUD Operations** for nurturing sequences
2. **Multiple Action Types** (Email, Tasks, etc.) // WhatsApp functionality moved to dustbin/whatsapp-dump/
3. **Funnel Integration** with automatic assignment
4. **Worker System** for automated execution
5. **Analytics & Statistics** tracking
6. **AI-Powered Sequence Generation**
7. **Lead Progress Tracking**
8. **Automation Event System** integration

### 🔄 Active Components

- **Controllers**: `nurturingSequenceController.js`, `leadNurturingController.js`
- **Services**: `nurturingService.js`
- **Workers**: `worker_nurturing_sequence.js`, `worker_scheduled_action_executor.js`
- **Schemas**: `NurturingSequence.js`, `NurturingStep.js`, `SequenceLog.js`
- **Examples**: Complete usage examples in `examples/nurturing_sequence_examples.js`

## API Routes

### Nurturing Sequence Management

#### Base URL: `/api/nurturing-sequences`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/` | Create a new nurturing sequence | Required |
| `GET` | `/` | Get all sequences for coach | Required |
| `GET` | `/:id` | Get a specific sequence | Required |
| `PUT` | `/:id` | Update a sequence | Required |
| `DELETE` | `/:id` | Delete a sequence | Required |

#### Sequence Operations

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/:id/duplicate` | Duplicate a sequence | Required |
| `PUT` | `/:id/toggle` | Toggle active status | Required |
| `GET` | `/:id/stats` | Get sequence statistics | Required |
| `POST` | `/:id/test` | Test sequence execution | Required |

#### Funnel Management

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/assign-to-funnel` | Assign sequence to funnel | Required |
| `POST` | `/remove-from-funnel` | Remove from funnel | Required |
| `POST` | `/bulk-assign` | Bulk assign to multiple funnels | Required |
| `GET` | `/:id/funnel-assignments` | Get funnel assignments | Required |

#### Category & Filtering

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/category/:category` | Get sequences by category | Required |

### Lead Nurturing Operations

#### Base URL: `/api/lead-nurturing`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/assign-sequence` | Assign sequence to lead | Required |
| `POST` | `/progress-step` | Progress lead to next step | Required |
| `GET` | `/status` | Get lead nurturing status | Required |

### Lead-Specific Nurturing Routes

#### Base URL: `/api/leads`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/assign-nurturing-sequence` | Assign sequence to specific lead | Required |
| `POST` | `/advance-nurturing-step` | Manually advance nurturing step | Required |
| `GET` | `/:leadId/nurturing-progress` | Get lead's nurturing progress | Required |
| `POST` | `/:leadId/generate-nurturing-sequence` | AI-generate sequence for lead | Required |

## Data Models

### NurturingSequence Schema

```javascript
{
  name: String,                    // Required
  description: String,            // Optional
  coachId: ObjectId,              // Required - Reference to User
  category: String,               // Enum: warm_lead, cold_lead, objection_handling, follow_up, reactivation, custom
  steps: [NurturingStepSchema],    // Array of steps
  assignedFunnels: [ObjectId],    // Array of funnel references
  isActive: Boolean,              // Default: true
  isDefault: Boolean,             // Default: false
  triggerConditions: {
    leadScore: { min: Number, max: Number },
    leadSource: [String],
    leadStatus: [String],
    leadTemperature: [String]
  },
  settings: {
    maxRetries: Number,           // Default: 3
    retryDelayDays: Number,       // Default: 2
    stopOnConversion: Boolean,    // Default: true
    allowManualAdvance: Boolean   // Default: true
  },
  stats: {
    totalLeads: Number,
    activeLeads: Number,
    completedLeads: Number,
    conversionRate: Number,
    averageCompletionTime: Number
  }
}
```

### NurturingStep Schema

```javascript
{
  stepNumber: Number,              // Required, sequential starting from 1
  name: String,                   // Required
  description: String,            // Optional
  actionType: String,             // Enum: send_email, create_task, update_lead_score, add_lead_tag, schedule_appointment, send_notification, wait_delay // send_whatsapp_message moved to dustbin/whatsapp-dump/
  actionConfig: Mixed,            // Required - Configuration for the action
  delayDays: Number,              // Default: 0
  delayHours: Number,             // Default: 0
  conditions: Mixed,              // Optional - Step-specific conditions
  isActive: Boolean               // Default: true
}
```

## Action Types

### 1. WhatsApp Message (`send_whatsapp_message`) - Moved to dustbin/whatsapp-dump/
```javascript
{
  message: "Hi {{lead.name}}! Welcome to our program!",
  template: "welcome_template",           // Optional
  mediaUrl: "https://example.com/file.pdf", // Optional
  callToAction: "Get Started",            // Optional
  tone: "friendly"                        // Optional
}
```

### 2. Email (`send_email`)
```javascript
{
  subject: "Welcome to our program!",
  body: "Hi {{lead.name}}, welcome to our program...",
  template: "email_template",             // Optional
  attachments: ["file1.pdf", "file2.jpg"] // Optional
}
```

### 3. Create Task (`create_task`)
```javascript
{
  title: "Follow up with {{lead.name}}",
  description: "Check in on their progress",
  priority: "medium",                     // low, medium, high
  assignedTo: "coach_id",                // Optional
  dueDate: "2024-01-15"                  // Optional
}
```

### 4. Update Lead Score (`update_lead_score`)
```javascript
{
  score: 25,                             // New score value
  reason: "Engaged with nurturing content",
  increment: true                         // Add to existing score instead of replacing
}
```

### 5. Add Lead Tag (`add_lead_tag`)
```javascript
{
  tags: ["engaged", "interested", "warm"],
  removeTags: ["cold", "unresponsive"]    // Optional - tags to remove
}
```

### 6. Schedule Appointment (`schedule_appointment`)
```javascript
{
  duration: 30,                           // Minutes
  type: "consultation",                   // consultation, follow_up, etc.
  message: "Let's schedule a call to discuss your goals",
  calendarLink: "https://calendly.com/..." // Optional
}
```

### 7. Send Notification (`send_notification`)
```javascript
{
  title: "New lead assigned",
  message: "{{lead.name}} has been assigned to you",
  type: "email",                          // email, push, sms
  recipients: ["coach_id"]               // Array of user IDs
}
```

### 8. Wait Delay (`wait_delay`)
```javascript
{
  reason: "Wait for lead response",
  customDelay: 48                        // Hours (overrides step delay)
}
```

## Usage Examples

### Creating a Warm Lead Sequence

```javascript
const warmLeadSequence = {
  name: "Warm Lead Welcome Sequence",
  description: "5-step sequence for leads who show initial interest",
  category: "warm_lead",
  triggerConditions: {
    leadScore: { min: 30, max: 70 },
    leadSource: ["Web Form", "Lead Magnet"],
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
      actionType: "send_whatsapp_message",
      actionConfig: {
        message: "Hi {{lead.name}}! 👋 Thanks for your interest!",
        template: "welcome_message"
      },
      delayDays: 0,
      delayHours: 0
    },
    {
      stepNumber: 2,
      name: "Value Proposition",
      actionType: "send_whatsapp_message",
      actionConfig: {
        message: "{{lead.name}}, here's what makes our program special...",
        mediaUrl: "https://example.com/program-overview.pdf"
      },
      delayDays: 1,
      delayHours: 0
    }
  ]
};

// Create the sequence
const response = await fetch('/api/nurturing-sequences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(warmLeadSequence)
});
```

### Assigning Sequence to Funnel

```javascript
const assignResponse = await fetch('/api/nurturing-sequences/assign-to-funnel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sequenceId: 'sequence_id_here',
    funnelId: 'funnel_id_here'
  })
});
```

### Testing Sequence Execution

```javascript
const testResponse = await fetch(`/api/nurturing-sequences/${sequenceId}/test`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    leadId: 'lead_id_here'
  })
});
```

## Automation System Integration

### Event Publishing

The nurturing system integrates with the automation system through RabbitMQ events:

```javascript
// Event published when nurturing step is triggered
{
  eventType: 'lead.nurture',
  actionType: 'send_whatsapp_message',
  config: { message: "Hi {{lead.name}}!" },
  payload: {
    leadId: 'lead_id',
    coachId: 'coach_id',
    stepIndex: 0,
    actionType: 'send_whatsapp_message',
    config: { message: "Hi {{lead.name}}!" },
    leadData: { /* lead object */ }
  }
}
```

### Scheduled Execution

The system uses a worker to automatically process nurturing sequences:

```javascript
// Worker runs every 5 minutes to check for due steps
setInterval(processNurturingSequences, 5 * 60 * 1000);
```

## Statistics & Analytics

### Sequence Statistics

```javascript
{
  totalLeads: 150,           // Total leads assigned to sequence
  activeLeads: 45,           // Currently active leads
  completedLeads: 89,        // Completed the sequence
  conversionRate: 59.33,     // Percentage of conversions
  averageCompletionTime: 7.2 // Days to complete sequence
}
```

### Lead Progress Tracking

```javascript
{
  sequence: { /* sequence object */ },
  currentStep: { /* current step object */ },
  stepIndex: 2,              // Current step number (0-based)
  progress: 40               // Percentage complete
}
```

## Error Handling

### Common Error Responses

```javascript
// Sequence not found
{
  success: false,
  message: 'Nurturing sequence not found'
}

// Invalid step configuration
{
  success: false,
  message: 'Step numbers must be sequential starting from 1'
}

// Sequence already assigned
{
  success: false,
  message: 'Sequence is already assigned to this funnel'
}

// Cannot delete active sequence
{
  success: false,
  message: 'Cannot delete sequence. 15 leads are currently using it.'
}
```

## Best Practices

### 1. Sequence Design
- Keep sequences focused on specific lead types
- Use appropriate delays between steps
- Include multiple touch points (Email, etc.) // WhatsApp functionality moved to dustbin/whatsapp-dump/
- Test sequences before assigning to funnels

### 2. Trigger Conditions
- Set realistic lead score ranges
- Consider lead source and status
- Use temperature-based targeting

### 3. Action Configuration
- Personalize messages using {{lead.name}} and other variables
- Include clear calls-to-action
- Use media attachments for engagement
- Set appropriate task priorities

### 4. Monitoring
- Regularly check sequence statistics
- Monitor conversion rates
- Adjust delays and content based on performance
- Use A/B testing for different approaches

## Future Enhancements

### Planned Features
1. **A/B Testing** for sequence variations
2. **Dynamic Content** based on lead behavior
3. **Advanced Analytics** with conversion tracking
4. **Sequence Templates** for common use cases
5. **Integration** with external CRM systems
6. **Mobile App** for sequence management
7. **Advanced Segmentation** based on lead behavior
8. **Multi-language** support for international coaches

### Technical Improvements
1. **Performance Optimization** for large-scale usage
2. **Real-time Analytics** dashboard
3. **Webhook Integration** for external systems
4. **Advanced Scheduling** with timezone support
5. **Bulk Operations** for sequence management

## Support & Troubleshooting

### Common Issues

1. **Sequences not executing**: Check worker status and RabbitMQ connection
2. **Steps not advancing**: Verify lead assignment and step configuration
3. **Messages not sending**: Check Email service configuration // WhatsApp functionality moved to dustbin/whatsapp-dump/
4. **Statistics not updating**: Ensure stats update methods are called

### Debug Information

Enable debug logging by setting environment variables:
```bash
DEBUG=nurturing:*
NODE_ENV=development
```

### Contact Information

For technical support or feature requests, contact the development team or create an issue in the project repository.

---

*Last Updated: January 2024*
*Version: 1.0.0*
