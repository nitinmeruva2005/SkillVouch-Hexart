import mongoose from 'mongoose';

const exchangeRequestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  fromUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  toUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  offeredSkill: {
    type: String,
    required: true
  },
  requestedSkill: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Number,
    default: null
  }
}, {
  timestamps: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes
exchangeRequestSchema.index({ fromUserId: 1 });
exchangeRequestSchema.index({ toUserId: 1 });
exchangeRequestSchema.index({ status: 1 });

export default mongoose.models.ExchangeRequest || mongoose.model('ExchangeRequest', exchangeRequestSchema);
