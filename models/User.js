import mongoose from 'mongoose';

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
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  discordLink: {
    type: String,
    default: null
  },
  skillsKnown: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  skillsToLearn: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ id: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
