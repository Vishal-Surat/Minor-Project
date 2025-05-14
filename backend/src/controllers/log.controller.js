// backend/src/controllers/log.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js'; // Correct import
import Log from '../models/Log.js';
import mongoose from 'mongoose'; // Add this at the top

// Create a new log
export const createLog = asyncHandler(async (req, res) => {
  const { sourceIP, destinationIP, severity, message, detectedBy, status } = req.body;

  if (!sourceIP || !destinationIP || !severity || !message || !detectedBy) {
    return res.status(400).json(sendError(res, 'Missing required fields')); // Use sendError
  }

  const log = await Log.create({
    sourceIP,
    destinationIP,
    severity,
    message,
    detectedBy,
    status: status || 'new',
  });

  return res.status(201).json(sendSuccess(res, log, 'Log created successfully')); // Use sendSuccess
});

// Get all logs with filters and pagination
export const getAllLogs = asyncHandler(async (req, res) => {
  const { severity, sourceIP, page = 1, limit = 10 } = req.query;
  const query = {};

  if (severity) query.severity = severity;
  if (sourceIP) query.sourceIP = sourceIP;

  const logs = await Log.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Log.countDocuments(query);

  return res.status(200).json(sendSuccess(res, {
    logs,
    total,
    page: Number(page),
    limit: Number(limit),
  }, 'Logs retrieved')); // Use sendSuccess
});

// Get log by ID
export const getLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(sendError(res, 'Invalid log ID'));
  }
  const log = await Log.findById(id);

  if (!log) {
    return res.status(404).json(sendError(res, 'Log not found'));
  }

  return res.status(200).json(sendSuccess(res, log, 'Log retrieved'));
});

// Update log status
export const updateLogStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const log = await Log.findByIdAndUpdate(id, { status }, { new: true });

  if (!log) {
    return res.status(404).json(sendError(res, 'Log not found')); // Use sendError
  }

  return res.status(200).json(sendSuccess(res, log, 'Log status updated')); // Use sendSuccess
});

// Delete log
export const deleteLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await Log.findByIdAndDelete(id);

  if (!log) {
    return res.status(404).json(sendError(res, 'Log not found')); // Use sendError
  }

  return res.status(200).json(sendSuccess(res, null, 'Log deleted')); // Use sendSuccess
});
