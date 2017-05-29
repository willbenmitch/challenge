import React, { Component } from 'react';
import Todo from './Todo';
import './TodoList.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3003');

class TodoList extends Component {
  constructor() {
    super();
    let localTodos = this.getLocalData('todos');
    let tempItem = this.getLocalData('tempItem');
    if (!localTodos || localTodos.length === 0) {
        this.state = {  
                        todos: [],
                        tempItem: ''
                     }
    } else {
        this.state = {
                        todos: localTodos,
                        tempItem: tempItem
                     }
    }

    socket.on('receive item', (data) => {
        console.log('received update');
        console.log(data);
        this.updateItemFromSockets(data);
    })

    this.socket = io('http://localhost:3003');

    this.getLocalData = this.getLocalData.bind(this);
    this.setLocalData = this.setLocalData.bind(this);
    this.updateItemFromSockets = this.updateItemFromSockets.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleItemCheck = this.handleItemCheck.bind(this);
    this.handleItemDelete = this.handleItemDelete.bind(this);
    this.handleDeleteAll = this.handleDeleteAll.bind(this);
    this.handleCompleteAll = this.handleCompleteAll.bind(this);
    
  }

  componentDidMount() {
    socket.on('load', (todos, err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('server:');
            console.log(todos);
            this.setState({todos: todos});
        }
    });
    socket.emit('load', {room: 'ada'});
  }

  getLocalData(name) {
      let  JSONName = JSON.stringify(name);
      let data = JSON.parse(localStorage.getItem(JSONName));
      return data;
  }

  setLocalData(name, data) {
      let JSONName = JSON.stringify(name);
      let JSONData = JSON.stringify(data);
      localStorage.setItem(JSONName, JSONData);
  }

  updateItemFromSockets(newData) {
    console.log(newData);
    let todos = this.state.todos.slice();
    todos.push({title: newData.newItem});
    this.setState({todos: todos});
  }

  handleChange(e) {
    this.setLocalData('tempItem', e.target.value);
    this.setState({
        tempItem: e.target.value
    });
  }

  handleAddItem(e) {
    e.preventDefault();
    socket.emit('make', {room: 'ada', newItem: this.state.tempItem});
    let todos = this.state.todos.slice();
    todos.push({title: this.state.tempItem});
    this.setLocalData('todos', todos);
    this.setLocalData('tempItem', '');
    this.setState({todos: todos, tempItem: ''})
  }

  handleItemCheck(item){
    let todos = this.state.todos.slice();
    
    // Would ideally use ids generated from a database, instead of title
    todos.map((todo) => {
        if(todo.title === item.title) {
            todo.done = !item.done;
            return todo;
        } else {
            return todo;
        }
    })
    this.setLocalData('todos', todos);
    this.setState({todos: todos});
  }

  handleItemDelete(item) {
      let todos = this.state.todos.slice();

      let filteredTodos = todos.filter(todo => {return todo.title !== item.title});
      this.setLocalData('todos', filteredTodos);
      this.setState({todos: filteredTodos});
  }

  handleDeleteAll() {
    this.setLocalData('todos', []);
    this.setState({todos: []});
  }

  handleCompleteAll() {
    let todos = this.state.todos.slice();

    todos.map((todo) => {
        todo.done = true;
        return todo;
    })
    this.setLocalData('todos', todos)
    this.setState({todos: todos});
  }
  
  render() {
    let todos = this.state.todos.slice();
    let todosJSX = [];
    todos.map((todo, i) => {
        return todosJSX.push(<Todo  todo={todo}
                                    id={i}
                                    key={i}
                                    handleItemCheck={this.handleItemCheck}
                                    handleItemDelete={this.handleItemDelete}/>);
        })
    console.log(todosJSX);
    return (
      <div >
        <form className="text-center" onSubmit={this.handleAddItem}>
            <input id="todo-input" value={this.state.tempItem} type="text" onChange={this.handleChange} placeholder="Feed the cat..." />
            <input className="btn btn-sm btn-success" style={{marginLeft: '2%'}} type="submit" value="make" />
        </form>
            <ul>
                {todosJSX}
            </ul>
            <button className="btn btn-danger btn-block btn_width-md"
                    onClick={this.handleDeleteAll}
                    >
                    delete all
            </button>
            <button className="btn btn-success btn-block btn_width-md"
                    onClick={this.handleCompleteAll}
                    >
                    complete all
            </button>
      </div>
    )
  }

}

export default TodoList;