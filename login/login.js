// Функция для сохранения данных в localStorage
function saveUserData(username, password, realName, age, location, description) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверка на существование пользователя
    if (users.some(user => user.username === username)) {
        alert('Пользователь с таким именем уже существует!');
        return false;
    }

    // Сохранение нового пользователя
    const newUser = {
        username,
        password,
        realName,
        age,
        location,
        description
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

// Обработчик события для формы регистрации
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Предотвращаем отправку формы
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const realName = document.getElementById('realName').value;
            const age = document.getElementById('age').value;
            const location = document.getElementById('location').value;
            const description = document.getElementById('description').value;

            if (saveUserData(username, password, realName, age, location, description)) {
                alert('Регистрация успешна!');
                window.location.href = '../index.html'; // Перенаправление на index.html
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Предотвращаем отправку формы
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (login(username, password)) {
                alert('Успешный вход!');
                localStorage.setItem('loggedInUser', username); // Сохраняем имя пользователя в localStorage
                window.location.href = '../index.html'; // Перенаправление на index.html
            } else {
                alert('Неверные учетные данные!');
            }
        });
    }
});

// Функция для входа
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("Проверка пользователей:", users); // Отладка
    const user = users.find(u => u.username === username);
    if (!user) {
        console.error("Пользователь не найден");
        return false;
    }
    console.log("Найден пользователь:", user); // Отладка
    if (user.password !== password) {
        console.error("Неверный пароль");
        return false;
    }
    console.log("Успешный вход!");
    return true;
} 