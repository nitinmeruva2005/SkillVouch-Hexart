import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  requestId: {
    type: String,
    required: true,
    ref: 'ExchangeRequest'
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
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: null
  },
  createdAt: {
    type: Number,
    required: true
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

// Create unique index for one feedback per request per user
feedbackSchema.index({ requestId: 1, fromUserId: 1 }, { unique: true });
feedbackSchema.index({ toUserId: 1 });

export default mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
