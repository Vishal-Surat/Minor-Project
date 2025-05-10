// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Exclude from queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // New fields for lockout functionality
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt with 12 rounds
    const salt = await bcrypt.genSalt(12);
    // Hash password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    console.log('Comparing passwords...');
    // Use bcrypt.compare to check if the entered password matches the hashed password
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Generate JWT method
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'fallback_secret_key_for_development', {
    expiresIn: '7d',
  });
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  // Check if lockUntil is set and the time is still in the future
  return this.lockUntil && this.lockUntil > Date.now();
};

// Reset failed attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { failedLoginAttempts: 0, lockUntil: null }
  });
};

// Increment failed attempts and lock if necessary
userSchema.methods.incrementLoginAttempts = function() {
  // If previous lock has expired, restart count
  const updates = {
    $inc: { failedLoginAttempts: 1 }
  };
  
  // Lock the account if failed attempts reach 5
  if (this.failedLoginAttempts + 1 >= 5) {
    // Set lockout time to 5 minutes from now
    updates.$set = { 
      lockUntil: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };
  }
  
  return this.updateOne(updates);
};

export default mongoose.model('User', userSchema);
