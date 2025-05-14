import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import Alert from '../models/Alert.js';
import mongoose from 'mongoose';

// Create a new alert
export const createAlert = asyncHandler(async (req, res) => {
  const { title, description, severity, source } = req.body;

  if (!title || !description || !severity || !source) {
    return res.status(400).json(sendError(res, 'All fields are required'));
  }

  const alert = await Alert.create({
    title,
    description,
    severity,
    source,
    status: 'open',
  });

  return res.status(201).json(sendSuccess(res, alert, 'Alert created successfully'));
});

// Get all alerts
export const getAllAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  return res.status(200).json(sendSuccess(res, alerts, 'All alerts fetched'));
});

// Get alert by ID
export const getAlertById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(sendError(res, 'Invalid alert ID'));
  }
  const alert = await Alert.findById(id);

  if (!alert) {
    return res.status(404).json(sendError(res, 'Alert not found'));
  }

  return res.status(200).json(sendSuccess(res, alert, 'Alert fetched'));
});

// Mark alert as resolved
export const resolveAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await Alert.findByIdAndUpdate(
    id,
    { status: 'resolved' },
    { new: true }
  );

  if (!alert) {
    return res.status(404).json(sendError(res, 'Alert not found'));
  }

  return res.status(200).json(sendSuccess(res, alert, 'Alert resolved'));
});

// Delete alert
export const deleteAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await Alert.findByIdAndDelete(id);

  if (!alert) {
    return res.status(404).json(sendError(res, 'Alert not found'));
  }

  return res.status(200).json(sendSuccess(res, null, 'Alert deleted'));
});
