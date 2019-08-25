const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = 4000;

let Todo = require('./todo.model');

app.use(cors());
app.use(bodyParser.json());
//mongoose.connect('mongodb://localhost:27017/todos', { useNewUrlParser: true });
mongoose.connect('mongodb://mongo-mongodb-replicaset-0.mongo-mongodb-replicaset.cje.svc.cluster.local:27017,\
                            mongo-mongodb-replicaset-1.mongo-mongodb-replicaset.cje.svc.cluster.local:27017,\
                            mongo-mongodb-replicaset-2.mongo-mongodb-replicaset.cje.svc.cluster.local:27017/todos?replicaSet=rs0', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

todoRoutes.route('/').get(function(req, res) {
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});


todoRoutes.route('/deleteall').get(function(req, res) {
    Todo.remove({},function(err) {
        if (err) {
            console.log(err);
        } else {
            res.end('success');
        }
    });
});

todoRoutes.route('/health').get(function(req, res) {
    var json = require('./package.json');
    res.status(200).send({ status: "OK", version: json.version });
});

todoRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});

todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

todoRoutes.route('/update/:id').put(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send('data is not found');
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo => {
                res.json('Todo updated');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

app.use('/todos', todoRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
module.exports = app;
