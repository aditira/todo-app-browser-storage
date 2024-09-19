// TOOGLE BUTTON
const chk = document.getElementById('chk');

chk.addEventListener('change', () => {
	document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        setCookie('theme', 'dark', 365);
    } else {
        setCookie('theme', 'light', 365);
    }
});

const floating_btn = document.querySelector('.floating-btn');
const close_btn = document.querySelector('.close-btn');
const social_panel_container = document.querySelector('.social-panel-container');


// ----- COOKIES: Save and Load Theme -----
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.remove('dark');
        chk.checked = false;
    } else {
        document.body.classList.toggle('dark');
        chk.checked = true;
    }
}

applyTheme(getCookie('theme'));

// ----- LOCALSTORAGE: Save and Load Todos -----
const title = document.getElementById('title');
const description = document.getElementById('description');
const label = document.getElementById('label');
const addBtn = document.getElementById('add-todo');

const todoListElement = document.getElementById('todo-list');

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(todo => {
        addTodoToUI(todo); 
        // Apply status 'done' pada UI
        const todoItems = document.querySelectorAll('.widget-heading');
        todoItems.forEach(item => {
            if (item.textContent.includes(todo.title)) {
                const badge = item.querySelector('.badge');
                const checkbox = item.closest('.widget-content-wrapper').querySelector('input[type="checkbox"]');
                const button = item.closest('.widget-content-wrapper').querySelector('.btn-outline-success');

                if (todo.done) {
                    badge.classList.remove('text-bg-primary');
                    badge.classList.add('text-bg-success');
                    badge.textContent = 'Completed';
                    item.style.textDecoration = 'line-through';
                    checkbox.disabled = true;
                    button.innerHTML = '<i class="fa fa-minus text-success"></i>';
                } else {
                    badge.classList.remove('text-bg-success');
                    badge.classList.add('text-bg-primary');
                    badge.textContent = 'Open';
                    item.style.textDecoration = 'none';
                    checkbox.disabled = false;
                    button.innerHTML = '<i class="fa fa-check text-primary"></i>';
                }
            }
        });
    });
}


function saveTodoToLocalStorage(todo) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function updateTodoInLocalStorage(oldTitle, newTitle, newDescription) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    todos = todos.map(todo => {
        if (todo.title === oldTitle) {
            todo.title = newTitle;
            todo.description = newDescription;
        }
        return todo;
    });

    localStorage.setItem('todos', JSON.stringify(todos));
}


function updateDoneLocalStorage(todoTitle) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    todos = todos.map(todo => {
        if (todo.title === todoTitle) {
            todo.done = !todo.done; // Toggle status done
        }
        return todo;
    });

    localStorage.setItem('todos', JSON.stringify(todos));
}


function deleteTodoFromLocalStorage(todoTitle) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    todos = todos.filter(todo => todo.title !== todoTitle);

    localStorage.setItem('todos', JSON.stringify(todos));

    // // refresh browser
    // location.reload();
}

// ----- IndexedDB: Save Detailed Todo (for future implementation) -----
let db;

function initIndexedDB() {
    const request = indexedDB.open("TodoAppDB", 1);
    
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("title", "title", { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };
}

function saveTodoToIndexedDB(todo) {
    const transaction = db.transaction(["todos"], "readwrite");
    const objectStore = transaction.objectStore("todos");
    const request = objectStore.add(todo);

    request.onsuccess = function(event) {
        console.log('Todo saved to IndexedDB:', event.target.result);
    };

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };
}

// ----- UI and Todo Management -----
function addTodoToUI(todo) {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    li.innerHTML = `
    <div class="todo-indicator bg-${todo.label}"></div>
        <div class="widget-content p-0">
            <div class="widget-content-wrapper">
                <div class="widget-content-left mr-2">
                    <div class="custom-checkbox custom-control">
                        <input class="custom-control-input" id="exampleCustomCheckbox12" type="checkbox">
                        <label class="custom-control-label" for="exampleCustomCheckbox12">&nbsp;</label>
                    </div>
                </div>
                <div class="widget-content-left">
                    <div class="widget-heading">${todo.title} <span class="badge text-bg-primary">Open</span></div>
                    <div class="widget-subheading"><i>${todo.description}</i></div>
                </div>
                <div class="widget-content-right">
                    <button onclick="toogleTodo('${todo.title}', '${todo.done}')" class="border-0 btn-transition btn btn-outline-success">
                        ${todo.done ?  '<i class="fa fa-minus"></i>' : '<i class="fa fa-check text-primary"></i>'} 
                    </button>
                    <button onclick="editTodo('${todo.title}')" class="border-0 btn-transition btn btn-outline-warning">
                        <i class="fa fa-pen"></i>
                    </button>
                    <button onclick="deleteTodo('${todo.title}')" class="border-0 btn-transition btn btn-outline-danger">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    todoListElement.appendChild(li);
}

function clearTodos() {
    todoListElement.innerHTML = '';
}

function addTodo() {
    const titleValue = title.value.trim();
    if (!titleValue) return;
    const descriptionValue = description.value.trim();
    if (!descriptionValue) return;
    const labelValue = label.value.trim();

    const todo = {
        title: titleValue,
        description: descriptionValue,
        label: labelValue,
        completed: false
    };

    addTodoToUI(todo);
    saveTodoToLocalStorage(todo);
    saveTodoToIndexedDB(todo);

    // clear input fields
    title.value = '';
    description.value = '';
}

function toogleTodo(todoTitle) {
    const todoItems = document.querySelectorAll('.widget-heading');

    todoItems.forEach(item => {
        if (item.textContent.includes(todoTitle)) {
            const badge = item.querySelector('.badge');
            const checkbox = item.closest('.widget-content-wrapper').querySelector('input[type="checkbox"]');
            const button = item.closest('.widget-content-wrapper').querySelector('.btn-outline-success');

            // Ambil data dari LocalStorage
            let todos = JSON.parse(localStorage.getItem('todos')) || [];
            const todo = todos.find(t => t.title === todoTitle);

            if (todo) {
                todo.done = !todo.done; // Toggle status 'done'

                // Ubah UI berdasarkan status 'done'
                if (todo.done) {
                    badge.classList.remove('text-bg-primary');
                    badge.classList.add('text-bg-success');
                    badge.textContent = 'Completed';
                    item.style.textDecoration = 'line-through';
                    checkbox.disabled = true;
                    button.innerHTML = '<i class="fa fa-minus text-success"></i>';
                } else {
                    badge.classList.remove('text-bg-success');
                    badge.classList.add('text-bg-primary');
                    badge.textContent = 'Open';
                    item.style.textDecoration = 'none';
                    checkbox.disabled = false;
                    button.innerHTML = '<i class="fa fa-check text-primary"></i>';
                }

                // Simpan perubahan di LocalStorage
                localStorage.setItem('todos', JSON.stringify(todos));
            }
        }
    });
}




function editTodo(todoTitle) {
    const todoItems = document.querySelectorAll('.widget-heading');
    
    todoItems.forEach(item => {
        if (item.textContent.includes(todoTitle)) {
            const newTitle = prompt('Edit Todo Title:', todoTitle);
            const newDescription = prompt('Edit Todo Description:', item.nextElementSibling.textContent.replace(/\s*<i>|<\/i>/g, ''));

            if (newTitle && newDescription) {
                item.textContent = newTitle;
                item.nextElementSibling.innerHTML = `<i>${newDescription}</i>`;

                // Optionally, update this todo in localStorage or wherever the data is stored
                updateTodoInLocalStorage(todoTitle, newTitle, newDescription);
            }
        }
    });
}

function deleteTodo(todoTitle) {
    const todoItems = document.querySelectorAll('.widget-heading');

    todoItems.forEach(item => {
        if (item.textContent.includes(todoTitle)) {
            const li = item.closest('li');
            li.remove(); // Hapus elemen dari UI tanpa refresh

            // Hapus dari LocalStorage tanpa reload halaman
            deleteTodoFromLocalStorage(todoTitle);
        }
    });
}


addBtn.addEventListener('click', addTodo);

// Load existing todos
loadTodos();
initIndexedDB();