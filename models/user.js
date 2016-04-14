// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  dateCreated: { type: Date, default: Date.now },
  pendingTasks: {type: [String], default: []}
});

// Export the Mongoose model
module.exports = mongoose.model('user', userSchema);
 