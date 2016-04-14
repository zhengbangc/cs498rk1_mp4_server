// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var taskSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, default: ""},
  deadline: {type: Date, required: true},
  completed: {type: Boolean, default: false},
  assignedUser: {type: String, default: ""},
  dateCreated: { type: Date, default: Date.now },
  assignedUserName: {type: String, default: "unassigned"}
  
});

// Export the Mongoose model
module.exports = mongoose.model('task', taskSchema);
