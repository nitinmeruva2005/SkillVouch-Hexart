import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  discordLink: {
    type: String,
    default: null
  },
  skills: [{
    type: String,
    trim: true
  }],
  skillsKnown: [{
    type: String,
    trim: true
  }],
  skillsToLearn: [{
    type: String,
    trim: true
  }],
  learningGoals: [{
    type: String,
    trim: true
  }],
  subjectsCompleted: [{
    type: String,
    trim: true
  }],
  subjectsToLearn: [{
    type: String,
    trim: true
  }],
  reputationScore: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  quizProgress: {
    type: Map,
    of: {
      score: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
      lastAttempt: { type: Date, default: null }
    },
    default: {}
  },
  roadmap: [{
    step: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    resources: [{ type: String }],
    completed: { type: Boolean, default: false }
  }],
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRequest'
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Never return password
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
