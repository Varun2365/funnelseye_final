// PRJ_YCT_Final/schema/Lead.js
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Lead must be associated with a coach.']
    },
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel',
        required: false
    },
    funnelName: {
        type: String,
        trim: true,
        maxlength: [100, 'Funnel name can not be more than 100 characters'],
        required: false
    },
    name: {
        type: String,
        required: [true, 'Please add a name for the lead'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    email: {
        type: String,
        required: function() { return !this.phone; },
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters'],
        required: function() { return !this.email; },
        trim: true
    },
    country: {
        type: String,
        trim: true,
        required: false
    },
    city: {
        type: String,
        trim: true,
        required: false
    },
    // --- LEAD QUALIFICATION FIELDS ---
    status: {
        type: String,
        default: 'New'
    },
    leadTemperature: {
        type: String,
        enum: ['Cold', 'Warm', 'Hot'],
        default: 'Warm',
        required: [true, 'Please specify lead temperature']
    },
    source: {
        type: String,
        required: [true, 'Please add a lead source'],
        default: 'Web Form'
    },
    targetAudience: {
        type: String,
        enum: ['client', 'coach'],
        required: false
    },
    // --- Booking Form Questions (Integrated) ---
    // Client-specific questions
    clientQuestions: {
        fullName: String,
        email: String,
        whatsappNumber: String,
        cityCountry: String,
        instagramUsername: String,
        watchedVideo: {
            type: String,
            enum: ['Yes', 'No', 'I plan to watch it soon']
        },
        profession: String,
        healthGoal: {
            type: String,
            enum: ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Increase Energy', 'Better Nutrition Habits', 'Other']
        },
        medicalConditions: String,
        age: Number,
        activityLevel: {
            type: String,
            enum: ['Very active', 'Moderately active', 'Not active']
        },
        supplements: String,
        readyToStart: {
            type: String,
            enum: ['Yes', 'No', 'Not sure']
        },
        willingToInvest: {
            type: String,
            enum: ['Yes', 'Need a flexible option', 'No']
        },
        biggestObstacle: String,
        seriousnessScale: {
            type: Number,
            min: 1,
            max: 10
        },
        motivation: String
    },
    // Coach-specific questions
    coachQuestions: {
        fullName: String,
        email: String,
        whatsappNumber: String,
        instagramUsername: String,
        description: {
            type: String,
            enum: ['Full-time job', 'Student', 'Housewife', 'Business owner', 'Unemployed', 'Other']
        },
        watchedVideo: {
            type: String,
            enum: ['Yes, 100%', 'Partially', 'Not yet']
        },
        reasonForBooking: String,
        supplements: String,
        mlmExperience: String,
        readiness: {
            type: String,
            enum: ['100% ready', 'Curious but exploring', 'Not sure yet']
        },
        commitment: {
            type: String,
            enum: ['Yes, fully committed', 'Maybe, depends on the plan', 'No, not ready']
        },
        timeCommitment: {
            type: String,
            enum: ['1-2 hours/day', '3-4 hours/day', 'Weekends only', 'Not sure']
        },
        canAttendZoom: {
            type: String,
            enum: ['Yes', 'No']
        },
        understandsOpportunity: {
            type: String,
            enum: ['Yes', 'No']
        },
        additionalInfo: String
    },
    // --- Lead Qualification Fields (Auto-populated) ---
    score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 100
    },
    qualificationInsights: [String],
    recommendations: [String],
    // --- END LEAD QUALIFICATION FIELDS ---

    notes: {
        type: String,
        maxlength: [2000, 'Notes can not be more than 2000 characters']
    },
    // --- END LEAD QUALIFICATION FIELDS ---

    lastFollowUpAt: {
        type: Date,
        required: false
    },
    nextFollowUpAt: {
        type: Date,
        required: false
    },
    followUpHistory: [
        {
            note: {
                type: String,
                required: [true, 'Follow-up note is required.']
            },
            followUpDate: {
                type: Date,
                default: Date.now
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            }
        }
    ],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    // --- NEW: APPOINTMENT & WORKFLOW FIELDS ---
    appointment: {
        status: {
            type: String,
            enum: ['Unbooked', 'Booked', 'Rescheduled', 'Confirmed', 'No Show', 'Attended'],
            default: 'Unbooked'
        },
        scheduledTime: {
            type: Date,
            required: false // Not all leads have a booked appointment
        },
        zoomLink: {
            type: String,
            required: false
        },
        assignedStaffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    },
    // We'll use a `score` field to track the lead's overall score.
    score: {
        type: Number,
        default: 0
    },
    // --- Automated Lead Nurturing ---
    nurturingSequence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NurturingSequence',
        required: false
    },
    nurturingStepIndex: {
        type: Number,
        default: 0
    },

    // --- Lead Magnet Interactions ---
    leadMagnetInteractions: [
        {
            type: {
                type: String,
                enum: ['ai_diet_planner', 'bmi_calculator', 'fitness_ebook', 'meal_planner', 'workout_calculator', 'progress_tracker', 'sleep_analyzer', 'stress_assessment'],
                required: true
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            conversion: {
                type: Boolean,
                default: false
            },
            conversionDate: {
                type: Date
            }
        }
    ],

    // --- Progress Tracking ---
    progressTracking: [
        {
            date: {
                type: Date,
                default: Date.now
            },
            data: {
                weight: Number,
                measurements: {
                    chest: Number,
                    waist: Number,
                    hips: Number,
                    arms: Number,
                    thighs: Number
                },
                workouts: [{
                    type: String,
                    duration: Number,
                    intensity: String,
                    calories: Number
                }],
                photos: [String],
                notes: String
            },
            metrics: {
                weightChange: Number,
                measurementChanges: mongoose.Schema.Types.Mixed,
                workoutProgress: mongoose.Schema.Types.Mixed
            }
        }
    ],

    // --- Lead Magnet Preferences ---
    leadMagnetPreferences: {
        fitnessGoals: [String],
        dietaryRestrictions: [String],
        activityLevel: String,
        preferredWorkoutTypes: [String],
        healthConditions: [String],
        timeAvailability: String
    },

}, {
    timestamps: true
});

// --- Indexes for efficient querying and preventing duplicates ---
LeadSchema.index({ coachId: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true, $ne: null } } });
LeadSchema.index({ coachId: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: null } } });
LeadSchema.index({ coachId: 1, status: 1 });
LeadSchema.index({ coachId: 1, leadTemperature: 1 });
LeadSchema.index({ coachId: 1, nextFollowUpAt: 1 });
LeadSchema.index({ coachId: 1, createdAt: -1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);