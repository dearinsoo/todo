const firebaseConfig = {
  apiKey: "AIzaSyCkDa7W7nAm0mh1TQZQq5QqANr8yUG-JXQ",
  authDomain: "todo-7d7c8.firebaseapp.com",
  databaseURL: "https://todo-7d7c8-default-rtdb.firebaseio.com",
  projectId: "todo-7d7c8",
  storageBucket: "todo-7d7c8.firebasestorage.app",
  messagingSenderId: "535130530897",
  appId: "1:535130530897:web:290d35c1b884abb9d94470",
  measurementId: "G-94MP51YN4Q",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const listRef = database.ref("list");

function mapFirebaseTodo(id, data) {
  if (!data || typeof data !== "object") return null;

  return {
    id,
    title: data.title || "",
    detail: data.description || "",
    date: data.date || "",
    time: data.time || "",
    completed: Boolean(data.completed),
    createdAt: data.createdAt || 0,
  };
}

function subscribeTodos(callback, onError) {
  listRef.on(
    "value",
    (snapshot) => {
      const data = snapshot.val();
      const todos = [];

      if (data) {
        Object.entries(data).forEach(([id, item]) => {
          const todo = mapFirebaseTodo(id, item);
          if (todo) todos.push(todo);
        });
      }

      callback(todos);
    },
    (error) => {
      console.error("Firebase 불러오기 실패:", error);
      if (onError) onError(error);
    }
  );
}

function addTodoToFirebase(todo) {
  return listRef.push({
    title: todo.title,
    description: todo.detail || "",
    date: todo.date,
    time: todo.time,
    completed: false,
    createdAt: Date.now(),
  });
}

function updateTodoInFirebase(id, updates) {
  const firebaseUpdates = {};

  if (updates.title !== undefined) firebaseUpdates.title = updates.title;
  if (updates.detail !== undefined) firebaseUpdates.description = updates.detail;
  if (updates.date !== undefined) firebaseUpdates.date = updates.date;
  if (updates.time !== undefined) firebaseUpdates.time = updates.time;
  if (updates.completed !== undefined) firebaseUpdates.completed = updates.completed;

  return listRef.child(id).update(firebaseUpdates);
}

function deleteTodoFromFirebase(id) {
  return listRef.child(id).remove();
}
