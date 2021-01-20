import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Col,
  Container,
  Row,
  Button,
  Card,
  CardBody,
  CustomInput,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  addTodosById,
  deleteTodosById,
  getAllTodos,
  updateTodosById,
} from "../http/http-calls";
import { addContent, addId } from "../redux/actions/content_data";
import { addUserAvatar, addTemplate } from "../redux/actions/user_data";
import { hideLoader, showLoader } from "../redux/actions/loader_data";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { connect } from "react-redux";
import QRCode from "qrcode.react";
import TodoForm from "./TodoForm";
import Todo from "./Todo";

import {
  FacebookShareButton,
  FacebookMessengerShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  FacebookMessengerIcon,
  LinkedinIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
} from "react-share";

class Links extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      todoToShow: "all",
      toggleAllComplete: true,
      focus: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    this._getAllTodos();
  }

_getAllTodos = async () => {
    let { todos } = this.state;
    // isLoading = true;
    this.props.showLoader();
    await getAllTodos().then(
      (res) => {
        console.log("TodoList", res);
        todos = res.todos;
        this.setState({ todos });
        this.props.hideLoader();
      },
      (error) => {
        this.setState({ isLoading: true });
        console.log("TodoList GetAll API Error : ", error);
      }
    );
  };

  _addTodo = async (todo) => {
    // this.setState((state) => ({
    //   todos: [todo, ...state.todos],
    //   status: false,
    // }));
    let { todos, isLoading } = this.state;
    const obj = {
      status: false,
      ...todo,
    };
    console.log(obj);
    this.props.showLoader();
    await addTodosById(obj).then(
      (res) => {
        console.log("added todo:", res);
        this._getAllTodos();
        this.props.hideLoader();
      },
      (error) => {
        console.log("error :", error);
      }
    );
  };

  _toggleComplete = (_id) => {
    this.setState((state) => ({
      todos: state.todos.map((todo) => {
        if (todo._id === _id) {
          // suppose to update
          const obj = {
            ...todo,
            complete: !todo.complete,
            status: !todo.status,
          };
          updateTodosById(obj, _id).then(
            (res) => {
              console.log(res);
            },
            (error) => {
              console.log("error :", error);
            }
          );
          return {
            ...todo,
            complete: !todo.complete,
            status: !todo.status,
            focus: false,
          };
        } else {
          return todo;
        }
      }),
    }));
  };

  _updateTodoToShow = (s) => {
    this.setState({
      todoToShow: s,
    });
  };

  _handleDeleteTodo = (_id) => {
    this.setState((state) => ({
      todos: state.todos.filter((todo) => todo._id !== _id),
    }));
    deleteTodosById(_id).then(
      (res) => {
        console.log(res);
      },
      (error) => {
        console.log("error :", error);
      }
    );
  };

  _removeAllTodosThatAreComplete = () => {
    this.setState((state) => ({
      todos: state.todos.filter((todo) => !todo.complete && !todo.status),
    }));
  };

  render() {
    let todos = [];

    if (this.state.todoToShow === "all") {
      todos = this.state.todos;
    } else if (this.state.todoToShow === "active") {
      todos = this.state.todos.filter((todo) => !todo.complete && !todo.status);
    } else if (this.state.todoToShow === "complete") {
      todos = this.state.todos.filter((todo) => todo.complete && todo.status);
    }
    return (
      <Fragment>
        <div className='todoapp stack-large' style={{ borderRadius: "10px" }}>
          <h1>Todos</h1>
          <TodoForm onSubmit={this._addTodo} />

          <div className='filters btn-group stack-exception'>
            <button
              type='button'
              className='btn toggle-btn'
              aria-pressed='true'
              onClick={() => this._updateTodoToShow("all")}>
              <span className='visually-hidden'>Show </span>
              <span>all</span>
              <span className='visually-hidden'> tasks</span>
            </button>
            <button
              type='button'
              className='btn toggle-btn'
              aria-pressed='false'
              onClick={() => this._updateTodoToShow("active")}>
              <span className='visually-hidden'>Show </span>
              <span>Active</span>
              <span className='visually-hidden'> tasks</span>
            </button>
            <button
              type='button'
              className='btn toggle-btn'
              aria-pressed='false'
              onClick={() => this._updateTodoToShow("complete")}>
              <span className='visually-hidden'>Show </span>
              <span>Completed</span>
              <span className='visually-hidden'> tasks</span>
            </button>
          </div>
          <h2 id='list-heading'>
            Tasks remaining :{" "}
            {this.state.todos.filter((todo) => !todo.complete).length}
          </h2>
          {/* <div className='d-flex justify-content-between align-items-center'>
            <button
              className='btn toggle-btn'
              onClick={() =>
                this.setState((state) => ({
                  todos: state.todos.map((todo) => ({
                    ...todo,
                    complete: state.toggleAllComplete,
                    status: state.toggleAllComplete,
                  })),
                  toggleAllComplete: !state.toggleAllComplete,
                }))
              }>
              toggle all complete: {`${this.state.toggleAllComplete}`}
            </button>
            {this.state.todos.some((todo) => todo.complete) ? (
              <div>
                <button
                  className='btn toggle-btn'
                  onClick={this._removeAllTodosThatAreComplete}>
                  remove all complete todos
                </button>
              </div>
            ) : null}
          </div> */}

          
           { todos.map((todo) => (
              <Todo
                key={todo._id}
                toggleComplete={() => this._toggleComplete(todo._id)}
                onDelete={() => this._handleDeleteTodo(todo._id)}
                todo={todo}
                onChecked={todo.status}
              />
            ))
           }
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contentData: state.contentData,
    userData: state.userData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addContent: (pageContents) => dispatch(addContent(pageContents)),
    addId: (_id) => dispatch(addId(_id)),
    showLoader: (loaderData) => dispatch(showLoader(loaderData)),
    hideLoader: (loaderData) => dispatch(hideLoader(loaderData)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Links);
// export default Links;
