import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  skillName: {
    type: String,
    required: true
  },
  questions: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
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

quizSchema.index({ skillName: 1 });
quizSchema.index({ difficulty: 1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
