// Функция для сохранения данных в localStorage
function saveUserData(userData) { // Принимаем объект пользователя
    // !!! ВАЖНО: Эта функция сейчас сохраняет данные в localStorage,
    // а не в ваш основной database.json. Логин через auth.js
    // не увидит этих пользователей. Вам нужно либо:
    // 1. Переделать регистрацию, чтобы она отправляла данные на сервер,
    //    который обновит database.json (предпочтительно).
    // 2. Переделать auth.js, чтобы он тоже читал из localStorage (менее надежно).
    // Пока я оставлю сохранение в localStorage, но имейте это в виду.

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(user => user.username === userData.username)) {
         return { success: false, message: 'Пользователь с таким именем уже существует!' };
    }

    // Добавляем ID (для примера, лучше генерировать уникальные ID)
    userData.id = `user${Date.now()}`;
    // Добавляем другие поля по умолчанию, если нужно
    userData.status = "offline";
    userData.avatar = "./assets/img/default-avatar.png"; // Пример аватара по умолчанию
    // ... другие поля ...

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    console.log("Новый пользователь сохранен в localStorage:", userData);
    return { success: true, message: 'Регистрация успешна!' };
}

// Обработчик события для формы регистрации
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const registrationMessageDiv = document.getElementById('registrationMessage');

    if (registrationForm && registrationMessageDiv) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            registrationMessageDiv.textContent = '';
            registrationMessageDiv.className = 'form-message';

            // Собираем данные из формы в объект
            const formData = new FormData(registrationForm);
            const userData = {};
            // Простое преобразование FormData в объект (нужно доработать для массивов/вложенности)
            for (const [key, value] of formData.entries()) {
                // Простая обработка, не учитывает массивы (topGames, languages и т.д.)
                // Это нужно будет реализовать более аккуратно
                 if(value) userData[key] = value; // Добавляем только непустые значения
            }
             // !!! Нужно доработать сбор данных для массивов и вложенных структур (topGames, schedule и т.д.)

            const result = saveUserData(userData);

            registrationMessageDiv.textContent = result.message;
            if (result.success) {
                registrationMessageDiv.classList.add('success');
                 // Сохраняем пользователя и перенаправляем
                 localStorage.setItem('loggedInUser', userData.username);
                 setTimeout(() => {
                     window.location.href = '../index.html';
                 }, 1500);
            } else {
                registrationMessageDiv.classList.add('error');
            }
        });
    }

    // Логика для формы логина (если она используется на этой же странице, что странно)
    // ... остальной код для loginForm ...
     // --- Начало существующего кода для loginForm ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Предотвращаем отправку формы
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (login(username, password)) { // Используем старую функцию login из этого файла
                // alert('Успешный вход!'); // Заменено
                console.log('Успешный вход через login.js!'); // Используем console пока нет messageDiv
                localStorage.setItem('loggedInUser', username); // Сохраняем имя пользователя в localStorage
                window.location.href = '../index.html'; // Перенаправление на index.html
            } else {
                // alert('Неверные учетные данные!'); // Заменено
                console.error('Неверные учетные данные через login.js!'); // Используем console
            }
        });
    }
     // --- Конец существующего кода для loginForm ---


});

// Функция для входа (дублирует auth.js, использует localStorage)
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("Проверка пользователей из localStorage:", users); // Отладка
    const user = users.find(u => u.username === username);
    if (!user) {
        console.error("Пользователь не найден в localStorage");
        return false;
    }
    console.log("Найден пользователь в localStorage:", user); // Отладка
    if (user.password !== password) {
        console.error("Неверный пароль (из localStorage)");
        return false;
    }
    console.log("Успешный вход (через localStorage)!");
    return true;
} 