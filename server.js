// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');

var Llama = require('./models/llama');
var User = require('./models/user');
var Task = require('./models/task');

var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://general:general@ds011820.mlab.com:11820/cs498rk1_mp4');
// mongoose.connect('mongodb://localhost/mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //give access to all domains
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
      // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    }
  // next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Nothing here. Go to /users or /tasks to play with the API.', data: [] });
});


//Users Route
var usersRoute = router.route('/users');

usersRoute.get(function(req, res){

	var where = eval("(" + req.query.where + ")");
	var sort = eval( "(" + req.query.sort + ")"); //1 for ascending and -1 for descending
	var select = eval("(" + req.query.select + ")");
	var skip = eval("(" + req.query.skip + ")");
	var limit = eval("(" + req.query.limit +  ")");
	var count = eval("(" + req.query.count + ")");

	var query_result;
	if (where === undefined)
		query_result = User.find({}, select);
	else
		query_result = User.find({}, select).where(where);

		query_result
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.exec(function(err, user){
		if(err)
			res.status(500).send(err);
		else if (count === true)
			res.status(200).json({message:'Users retrieved from the database!', data:user.length});
		else
			res.status(200).json({message:'Users retrieved from the database!', data:user});
	});

});

usersRoute.post(function(req,res){
	var user = new User();
	user.name = req.body.name;
	user.email = req.body.email;
	user.pendingTasks = req.body.pendingTasks;
	if (req.body.email === undefined || req.body.email === [])
		return res.status(500).json({message: 'Validation Error: An email is required!', data: []});
	if(req.body.name === undefined || req.body.name === [])
		return res.status(500).json({message: 'Validation Error: A name is required!', data: []});

	User.findOne({email: req.body.email}, function(err, user_exist){
		console.log(req.body.email);
		// console.log(user_exist);
		if (user_exist !== null) {
			res.status(500).json({message: 'This email already exists', data: []});
		// console.log(user);
		}
		else {
			// console.log(104)
			user.save(function(err){
				if(err)
					res.status(500).send(err);
				else 
					res.status(201).json({message: 'User added to the database!', data: user});
			});
		}
	});
});

usersRoute.options(function(req, res){
	res.writeHead(200);
    res.end();
});

//User Route
var userRoute = router.route('/users/:user_id');

userRoute.get(function(req, res){

		if (req.params.user_id.length !== 24)
			return res.status(404).json({message: 'User not found.', data: []});
		User.findById(req.params.user_id, function(err, user){
			// console.log("128");
			if(err)
				res.status(500).send(err);
			else if (user === null)
				res.status(404).json({message: 'User not found.', data: []});
			else 
				res.status(200).json({message: 'User retrieved from the database!', data: user});
		});
});

userRoute.put(function(req, res){
	if (req.params.user_id.length !== 24)
			return res.status(404).json({message: 'User not found. Id format incorrect.', data: []});  
	if (req.body.email === undefined || req.body.email === [])
		return res.status(500).json({message: 'Validation Error: An email is required!', data: []});
	if(req.body.name === undefined || req.body.name === [])
		return res.status(500).json({message: 'Validation Error: A name is required!', data: []});
	// console.log(req.body.email);

	User.findOne({_id: req.params.user_id}, function(err, user){
		if (err)
			res.status(500).send(err); 
		else if (user === null)
			res.status(404).json({message: 'User not found. No such user _id in the database', data: []});
		else{
			User.findOne({email: req.body.email}, function(err, user_exist){
				if (user_exist !== null && user_exist._id != req.params.user_id){
					// console.log(user_exist._id);
					// console.log(req.params.user_id);
					return res.status(500).json({message: 'This email already exists', data: []});
				}
				else {
					var user_new = new User();
					user_new._id = req.params.user_id;
					// console.log(typeof req.params.user_id);
					user_new.name = req.body.name;
					user_new.email = req.body.email;
					if(req.body.pendingTasks !== undefined)
						user_new.pendingTasks = req.body.pendingTasks;

					User.findByIdAndUpdate(req.params.user_id, {$set: user_new}, {new: true}, function(err, updated_user){
						if(err)
							return res.status(500).send(err); 
						else 
							return res.status(200).json({message: 'User updated', data: updated_user});
					});
				}
			});
		}
	});
});



userRoute.delete(function(req, res){
	if (req.params.user_id.length !== 24)
			return res.status(404).json({message: 'User not found. Id format incorrect.', data: []});

	User.findByIdAndRemove(req.params.user_id, function(err, user){
		if(err)
			res.status(500).send(err);
		else if (user === null)
			res.status(404).json({message: 'User not found.', data: []});
		else 
			res.status(200).json({message:'User deleted from the database!', data: []});
	});
});

//Tasks Route
var tasksRoute = router.route('/tasks');

tasksRoute.get(function(req, res){
	var where = eval("(" + req.query.where + ")");
	var sort = eval( "(" + req.query.sort + ")"); //1 for ascending and -1 for descending
	var select = eval("(" + req.query.select + ")");
	var skip = eval("(" + req.query.skip + ")");
	var limit = eval("(" + req.query.limit +  ")");
	var count = eval("(" + req.query.count + ")");

	var query_result;
	if (where === undefined)
		query_result = Task.find({}, select);
	else
		query_result = Task.find({}, select).where(where);

		query_result
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.exec(function(err, user){
		if(err)
			res.status(500).send(err);
		else if (count === true)
			res.status(200).json({message:'Tasks retrieved from the database!', data:user.length});
		else
			res.status(200).json({message:'Tasks retrieved from the database!', data:user});
	});
});

tasksRoute.post(function(req, res){
	var task = new Task();
	task.name = req.body.name;
	task.description = req.body.description;
	task.deadline = req.body.deadline;
	task.completed = req.body.completed;
	task.assignedUser = req.body.assignedUser;
	task.dateCreated = req.body.dateCreated;
	task.assignedUserName = req.body.assignedUserName;
	if (req.body.name === undefined || req.body.name === [])
		return res.status(500).json({message:'Validation Error: A name is required', data: []});
	if(req.body.deadline === undefined || req.body.deadline == [])
		return res.status(500).json({message:'Validation Error: A deadline is required', data: []});

	task.save(function(err){
		if(err)
			res.status(500).send(err);
		else 
			res.status(201).json({message: 'task added to the database!', data: task});
	});
});


tasksRoute.options(function(req, res){
	res.writeHead(200);
	res.end();
});

//Task Route
var taskRoute = router.route('/tasks/:task_id');

taskRoute.get(function(req, res){
	if(req.params.task_id.length !== 24)
		return res.status(404).json({message: 'Task not found. Id format incorrect.', data: []});

	Task.findById(req.params.task_id, function(err, task){
		if(err)
			res.status(500).send(err);
		else if (task === null)
			res.status(404).json({message: 'Task not found.', data: []});
		else 
			res.status(200).json({message: 'Task retrieved from the database!', data: task});
	});
});

taskRoute.put(function(req, res){
	if (req.params.task_id.length !== 24)
			return res.status(404).json({message: 'Task not found. Id format incorrect.', data: []});  
	if (req.body.name === undefined || req.body.name === []) 
		return res.status(500).json({message: 'Validation Error: A name is required!', data: []});
	if(req.body.deadline === undefined || req.body.deadline === [])
		return res.status(500).json({message: 'Validation Error: A deadline is required!', data: []});

	Task.findOne({_id: req.params.task_id}, function(err, task){
		if(err)
			res.status(500).send(err);
		else if (task === null)
			res.status(404).json({message: 'Task not found. No such task_id in the database', data: []});
		else{
			var task_new = new Task();
			task_new._id = req.body.task_id;
			task_new.name = req.body.name;
			task_new.description = req.body.description;
			task_new.deadline = req.body.deadline;
			task_new.completed = req.body.completed;
			task_new.assignedUser = req.body.assignedUser;
			task_new.dateCreated = req.body.dateCreated;
			task_new.assignedUserName = req.body.assignedUserName;

			Task.findByIdAndUpdate(req.params.task_id, {$set: task_new}, {new: true}, function(err, updated_task){
				if (err)
					return res.status(500).send(err);
				else
					return res.status(200).json({message: 'Task updated', data: updated_task});
			});

		}
	});


});

taskRoute.delete(function(req, res){
	if(req.params.task_id.length !== 24)
		return res.status(404).json({message: 'Task not found. Id format incorrect', data: []});

	Task.findByIdAndRemove(req.params.task_id, function(err, task){
		// console.log(req.params.task_id);
		// console.log(task);
		if(err)
			res.status(500).send(err);
		else if (task === null)
			res.status(404).json({message: 'Task not found.', data: [] });
		else
			res.status(200).json({message: 'Task deleted from the database!', data: []});
	});

});



// Start the server
app.listen(port);
console.log('Server running on port ' + port);
