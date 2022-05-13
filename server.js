var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Meet for lunch',
    completed: false
}, {
    id: 2,
    description: 'Go to gym',
    completed: false
}, {
    id: 3,
    description: 'meditate',
    completed: true
}];

app.get('/', (req, res) => {
    res.send('TODO API Root');
});

app.get('/todos', (req, res) => {
    res.json(todos);
})

app.get('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo;

    todos.forEach((todo) => {
        if(todoId === todo.id) {
            matchedTodo = todo;
        }
    });

    if(matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.listen(PORT, () => {
    console.log('Express listening on port '+PORT);
});