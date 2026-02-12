import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  quizId: {
    type: String,
    required: true,
    ref: 'Quiz'
  },
  answers: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  completedAt: {
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

quizAttemptSchema.index({ userId: 1 });
quizAttemptSchema.index({ quizId: 1 });

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);
