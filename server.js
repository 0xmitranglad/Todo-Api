var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TODO API Root');
});

app.get('/todos', (req, res) => {
    let query = req.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if(query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%',
        };
    }
    
    db.todo.findAll({where: where}).then((todos) => {
        res.json(todos);
    }, (err) => {
        res.status(500).send();
    })
});

app.get('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then((todo) => {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, (err) => {
        res.status(500).send();
    });
});

app.post('/todos', (req, res) => {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then((todo) => {
        res.json(todo.toJSON());
    }, (err) => {
        res.status(400).json(err);
    });
});

app.delete('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then((rowsDeleted) => {
        if(rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with id'
            });
        } else {
            res.status(204).send();
        }   
    }, () => { 
        res.status(500).send();
    });
});

app.put('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if(!matchedTodo) {
        return res.status(404).send()
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if(body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if(body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);

});

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log('Express listening on port '+PORT);
    });
});


