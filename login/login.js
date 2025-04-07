function saveUserData(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.username === userData.username)) {
         return { success: false, message: 'Пользователь с таким именем уже существует!' };
    }

    userData.id = `user${Date.now()}`;
    userData.status = "offline";
    userData.avatar = "./assets/img/default-avatar.png";

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    console.log("Новый пользователь сохранен в localStorage:", userData);
    return { success: true, message: 'Регистрация успешна!' };
}

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const registrationMessageDiv = document.getElementById('registrationMessage');

    if (registrationForm && registrationMessageDiv) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            registrationMessageDiv.textContent = '';
            registrationMessageDiv.className = 'form-message';

            const formData = new FormData(registrationForm);
            const userData = {};
            for (const [key, value] of formData.entries()) {
                 if(value) userData[key] = value;
            }

            const result = saveUserData(userData);

            registrationMessageDiv.textContent = result.message;
            if (result.success) {
                registrationMessageDiv.classList.add('success');
                 localStorage.setItem('loggedInUser', userData.username);
                 setTimeout(() => {
                     window.location.href = '../index.html';
                 }, 1500);
            } else {
                registrationMessageDiv.classList.add('error');
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (login(username, password)) {
                console.log('Успешный вход через login.js!');
                localStorage.setItem('loggedInUser', username);
                window.location.href = '../index.html';
            } else {
                console.error('Неверные учетные данные через login.js!');
            }
        });
    }
});

function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("Проверка пользователей из localStorage:", users);
    const user = users.find(u => u.username === username);
    if (!user) {
        console.error("Пользователь не найден в localStorage");
        return false;
    }
    console.log("Найден пользователь в localStorage:", user);
    if (user.password !== password) {
        console.error("Неверный пароль (из localStorage)");
        return false;
    }
    console.log("Успешный вход (через localStorage)!");
    return true;
}