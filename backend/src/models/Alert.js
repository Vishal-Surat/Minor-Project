// backend/src/models/Alert.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert must have a title'],
  },
  description: {
    type: String,
    required: [true, 'Alert must have a description'],
  },
  type: {
    type: String,
    enum: ['intrusion', 'malware', 'phishing', 'unauthorized-access', 'dos'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: 'InternalSystem',
  },
}, { timestamps: true });

alertSchema.index({ type: 1 });
alertSchema.index({ severity: 1 });

export default mongoose.model('Alert', alertSchema);
