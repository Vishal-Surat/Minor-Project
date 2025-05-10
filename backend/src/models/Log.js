// backend/src/models/Log.js
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  sourceIP: {
    type: String,
    required: true,
  },
  destinationIP: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  message: {
    type: String,
    required: true,
  },
  detectedBy: {
    type: String,
    default: 'System',
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'ignored'],
    default: 'active',
  },
}, { timestamps: true });

logSchema.index({ sourceIP: 1 });
logSchema.index({ severity: 1 });

export default mongoose.model('Log', logSchema);
