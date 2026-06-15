const STORAGE_KEY = "todo-app-items";

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const modalOverlay = document.getElementById("modalOverlay");
const detailModalOverlay = document.getElementById("detailModalOverlay");
const closeDetailModalBtn = document.getElementById("closeDetailModalBtn");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const todoForm = document.getElementById("todoForm");
const todayList = document.getElementById("todayList");
const allList = document.getElementById("allList");
const todayEmpty = document.getElementById("todayEmpty");
const allEmpty = document.getElementById("allEmpty");
const todayDateEl = document.getElementById("todayDate");
const todoDateInput = document.getElementById("todoDate");
const todoTimeInput = document.getElementById("todoTime");
const detailTitleInput = document.getElementById("detailTitle");
const detailContentInput = document.getElementById("detailContent");
const detailDateInput = document.getElementById("detailDate");
const detailTimeInput = document.getElementById("detailTime");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailToggleCompleteBtn = document.getElementById("detailToggleCompleteBtn");
const listViewBtn = document.getElementById("listViewBtn");
const calendarViewBtn = document.getElementById("calendarViewBtn");
const listViewPanel = document.getElementById("listViewPanel");
const calendarViewPanel = document.getElementById("calendarViewPanel");
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthTitle = document.getElementById("calendarMonthTitle");
const calendarEmpty = document.getElementById("calendarEmpty");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

let todos = loadTodos();
let detailTodoId = null;
let detailEditMode = false;
let currentView = "list";
const now = new Date();
let calendarYear = now.getFullYear();
let calendarMonth = now.getMonth();

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${year}년 ${month}월 ${day}일 (${weekdays[date.getDay()]})`;
}

function formatDisplayTime(timeStr) {
  const [hour, minute] = timeStr.split(":");
  const h = Number(hour);
  const period = h < 12 ? "오전" : "오후";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${displayHour}:${minute}`;
}

function sortTodos(list) {
  return [...list].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

function createTodoElement(todo, isToday) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.completed ? " completed" : ""}`;
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const content = document.createElement("div");
  content.className = "todo-content";

  const title = document.createElement("div");
  title.className = "todo-title";
  title.textContent = todo.title;

  content.appendChild(title);

  if (todo.detail) {
    const detail = document.createElement("div");
    detail.className = "todo-detail";
    detail.textContent = todo.detail;
    content.appendChild(detail);
  }

  const meta = document.createElement("div");
  meta.className = "todo-meta";

  const dateBadge = document.createElement("span");
  dateBadge.className = `todo-badge${isToday ? " today" : ""}`;
  dateBadge.textContent = `📅 ${formatDisplayDate(todo.date)}`;

  const timeBadge = document.createElement("span");
  timeBadge.className = "todo-badge";
  timeBadge.textContent = `🕐 ${formatDisplayTime(todo.time)}`;

  meta.appendChild(dateBadge);
  meta.appendChild(timeBadge);
  content.appendChild(meta);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-delete";
  deleteBtn.textContent = "삭제";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(content);
  li.appendChild(deleteBtn);

  return li;
}

function createAllTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item todo-item-compact${todo.completed ? " completed" : ""}`;
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const content = document.createElement("div");
  content.className = "todo-content";

  const titleBtn = document.createElement("button");
  titleBtn.type = "button";
  titleBtn.className = "todo-title-btn";
  titleBtn.textContent = todo.title;
  titleBtn.addEventListener("click", () => openDetailModal(todo.id));

  content.appendChild(titleBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-delete";
  deleteBtn.textContent = "삭제";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(content);
  li.appendChild(deleteBtn);

  return li;
}

function getDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function setView(view) {
  currentView = view;
  listViewPanel.hidden = view !== "list";
  calendarViewPanel.hidden = view !== "calendar";
  listViewBtn.classList.toggle("active", view === "list");
  calendarViewBtn.classList.toggle("active", view === "calendar");

  if (view === "calendar") {
    renderCalendar();
  }
}

function renderCalendar() {
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = getTodayString();

  calendarMonthTitle.textContent = `${calendarYear}년 ${calendarMonth + 1}월`;
  calendarGrid.innerHTML = "";

  let hasMonthTodos = false;

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day calendar-day-empty";
    empty.setAttribute("aria-hidden", "true");
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = getDateString(calendarYear, calendarMonth, day);
    const dayTodos = sortTodos(todos.filter((todo) => todo.date === dateStr));

    if (dayTodos.length > 0) {
      hasMonthTodos = true;
    }

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    if (dateStr === today) {
      dayEl.classList.add("calendar-day-today");
    }

    const dayNum = document.createElement("div");
    dayNum.className = "calendar-day-num";
    dayNum.textContent = day;
    dayEl.appendChild(dayNum);

    if (dayTodos.length > 0) {
      const todoList = document.createElement("ul");
      todoList.className = "calendar-todo-list";

      dayTodos.forEach((todo) => {
        const item = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `calendar-todo-item${todo.completed ? " completed" : ""}`;
        btn.textContent = `${formatDisplayTime(todo.time)} ${todo.title}`;
        btn.addEventListener("click", () => openDetailModal(todo.id));
        item.appendChild(btn);
        todoList.appendChild(item);
      });

      dayEl.appendChild(todoList);
    }

    calendarGrid.appendChild(dayEl);
  }

  calendarEmpty.classList.toggle("hidden", hasMonthTodos);
}

function changeCalendarMonth(offset) {
  calendarMonth += offset;

  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear += 1;
  } else if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear -= 1;
  }

  renderCalendar();
}

function render() {
  const today = getTodayString();
  todayDateEl.textContent = formatDisplayDate(today);

  const sorted = sortTodos(todos);
  const todayTodos = sorted.filter((todo) => todo.date === today);

  todayList.innerHTML = "";
  allList.innerHTML = "";

  todayTodos.forEach((todo) => {
    todayList.appendChild(createTodoElement(todo, true));
  });

  sorted.forEach((todo) => {
    allList.appendChild(createAllTodoElement(todo));
  });

  todayEmpty.classList.toggle("hidden", todayTodos.length > 0);
  allEmpty.classList.toggle("hidden", sorted.length > 0);

  if (currentView === "calendar") {
    renderCalendar();
  }
}

function openModal() {
  todoForm.reset();
  todoDateInput.value = getTodayString();
  todoTimeInput.value = "09:00";
  modalOverlay.hidden = false;
  document.getElementById("todoTitle").focus();
}

function closeModal() {
  modalOverlay.hidden = true;
}

function setDetailFieldsReadonly(readonly) {
  detailTitleInput.readOnly = readonly;
  detailContentInput.readOnly = readonly;
  detailDateInput.readOnly = readonly;
  detailTimeInput.readOnly = readonly;
}

function updateDetailToggleButton(todo) {
  if (todo.completed) {
    detailToggleCompleteBtn.textContent = "미완료";
    detailToggleCompleteBtn.className = "btn btn-secondary";
  } else {
    detailToggleCompleteBtn.textContent = "완료";
    detailToggleCompleteBtn.className = "btn btn-success";
  }
}

function exitDetailEditMode() {
  detailEditMode = false;
  detailEditBtn.textContent = "편집";
  setDetailFieldsReadonly(true);
}

function openDetailModal(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  detailTodoId = id;
  detailEditMode = false;
  detailTitleInput.value = todo.title;
  detailContentInput.value = todo.detail || "";
  detailDateInput.value = todo.date;
  detailTimeInput.value = todo.time;
  detailEditBtn.textContent = "편집";
  setDetailFieldsReadonly(true);
  updateDetailToggleButton(todo);
  detailModalOverlay.hidden = false;
}

function closeDetailModal() {
  detailModalOverlay.hidden = true;
  detailTodoId = null;
  exitDetailEditMode();
}

function saveDetailEdit() {
  const todo = todos.find((item) => item.id === detailTodoId);
  if (!todo) return;

  const title = detailTitleInput.value.trim();
  const detail = detailContentInput.value.trim();
  const date = detailDateInput.value;
  const time = detailTimeInput.value;

  if (!title || !date || !time) return;

  todo.title = title;
  todo.detail = detail;
  todo.date = date;
  todo.time = time;

  saveTodos();
  render();
  exitDetailEditMode();
}

function handleDetailEdit() {
  if (!detailTodoId) return;

  if (!detailEditMode) {
    detailEditMode = true;
    detailEditBtn.textContent = "저장";
    setDetailFieldsReadonly(false);
    detailTitleInput.focus();
    return;
  }

  saveDetailEdit();
}

function toggleDetailTodo() {
  if (!detailTodoId) return;

  toggleTodo(detailTodoId);

  const todo = todos.find((item) => item.id === detailTodoId);
  if (todo) {
    updateDetailToggleButton(todo);
  }
}

function addTodo(event) {
  event.preventDefault();

  const title = document.getElementById("todoTitle").value.trim();
  const detail = document.getElementById("todoDetail").value.trim();
  const date = todoDateInput.value;
  const time = todoTimeInput.value;

  if (!title || !date || !time) return;

  todos.push({
    id: crypto.randomUUID(),
    title,
    detail,
    date,
    time,
    completed: false,
    createdAt: Date.now(),
  });

  saveTodos();
  render();
  closeModal();
}

function toggleTodo(id) {
  const todo = todos.find((item) => item.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((item) => item.id !== id);
  saveTodos();
  render();
}

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
closeDetailModalBtn.addEventListener("click", closeDetailModal);
detailCloseBtn.addEventListener("click", closeDetailModal);
detailEditBtn.addEventListener("click", handleDetailEdit);
detailToggleCompleteBtn.addEventListener("click", toggleDetailTodo);
listViewBtn.addEventListener("click", () => setView("list"));
calendarViewBtn.addEventListener("click", () => setView("calendar"));
prevMonthBtn.addEventListener("click", () => changeCalendarMonth(-1));
nextMonthBtn.addEventListener("click", () => changeCalendarMonth(1));
todoForm.addEventListener("submit", addTodo);

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

detailModalOverlay.addEventListener("click", (event) => {
  if (event.target === detailModalOverlay) closeDetailModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!modalOverlay.hidden) closeModal();
  else if (!detailModalOverlay.hidden) closeDetailModal();
});

render();
