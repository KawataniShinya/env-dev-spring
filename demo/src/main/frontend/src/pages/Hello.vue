<template>
  <div class="container">
    <h1>Welcome to Spring Boot with Vue.js</h1>

    <div class="card">
      <p>{{ message }}</p>
      <p>
        <a class="logout-button" href="http://localhost.spring-app-dev.sample.jp/logout">Logout</a>
      </p>
    </div>

    <div class="card">
      <h2>Vue.js Counter Example</h2>
      <p>Count: {{ count }}</p>
      <button @click="increment">Increment</button>
      <button @click="decrement">Decrement</button>

      <div>
        <h3>Todo List</h3>
        <input v-model="newTodo" @keyup.enter="addTodo" placeholder="Add new todo">
        <ul>
          <li v-for="(todo, index) in todos" :key="index">
            {{ todo }}
          </li>
        </ul>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  data() {
    return {
      message: '',
      count: 0,
      newTodo: '',
      todos: []
    }
  },
  mounted() {
      const el = document.getElementById('hello')
      this.message = el && el.dataset ? (el.dataset.message || 'Default message') : 'Default message'
  },
  methods: {
    increment() { this.count++ },
    decrement() { this.count-- },
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push(this.newTodo)
        this.newTodo = ''
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  border: 1px solid #ddd;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background-color: #45a049;
}

.logout-button {
  display: inline-block;
  background-color: #f44336;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 10px;
}

.logout-button:hover {
  background-color: #d32f2f;
}
</style>
