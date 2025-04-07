// auth.js - Теперь работает с localStorage

const STORAGE_KEY = 'appUsers'; // Ключ для localStorage

// Функция для получения пользователей из хранилища
function getUsersFromStorage() {
    try {
        const usersJson = localStorage.getItem(STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
        console.error("Ошибка чтения пользователей из localStorage:", e);
        return [];
    }
}

// Функция для сохранения пользователей в хранилище
function saveUsersToStorage(users) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("Ошибка сохранения пользователей в localStorage:", e);
    }
}

window.isAuthReady = false;

async function initAuth() {
    let initialUsers = [];
    // Попробуем загрузить начальных пользователей из JSON, если localStorage пуст
    const storedUsers = getUsersFromStorage();

    if (storedUsers.length === 0) {
        try {
            console.log("Auth: localStorage пуст, загружаем из database.json...");
            const response = await fetch("../database.json"); // Путь от auth.js
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const db = await response.json();
            initialUsers = db.users || [];
            // Сохраняем начальных пользователей в localStorage
            saveUsersToStorage(initialUsers);
            console.log(`Auth: Загружено и сохранено ${initialUsers.length} пользователей из JSON.`);
        } catch (error) {
            console.error("Auth: Не удалось загрузить начальных пользователей из JSON:", error);
            // Продолжаем без начальных данных, если localStorage пуст
             saveUsersToStorage([]); // Убедимся, что ключ существует
        }
    } else {
         console.log(`Auth: Используются ${storedUsers.length} пользователей из localStorage.`);
         initialUsers = storedUsers; // Используем то, что уже есть
    }


    // --- Функция входа (использует localStorage) ---
    window.login = function(username, password) {
        const users = getUsersFromStorage();
        const user = users.find(u => u.username === username);

        if (!user) {
            console.log(`Auth: Попытка входа - Пользователь '${username}' не найден в localStorage.`);
            return { success: false, message: "Пользователь с таким именем не найден." };
        }
        if (user.password !== password) { // В реальном приложении здесь должно быть сравнение хешей
            console.log(`Auth: Попытка входа - Неверный пароль для '${username}'.`);
            return { success: false, message: "Неверный пароль." };
        }

        console.log(`Auth: Успешный вход (localStorage) для '${username}'!`);
        localStorage.setItem('loggedInUser', username); // Сохраняем имя вошедшего
        return { success: true };
    };

    // --- Функция регистрации (сохраняет в localStorage) ---
     window.register = function(userData) {
         const users = getUsersFromStorage();

         if (users.some(u => u.username === userData.username)) {
             console.log(`Auth: Попытка регистрации - Пользователь '${userData.username}' уже существует.`);
             return { success: false, message: 'Пользователь с таким именем уже существует!' };
         }

         // Добавляем базовые поля (пароль должен быть уже в userData)
         const newUser = {
             id: `user${Date.now()}`, // Простой генератор ID
             status: "offline",
             avatar: userData.avatar || "./assets/img/default-avatar.png", // Аватар по умолчанию
             emailUser: false, // Пример поля
             // ... копируем остальные поля из userData ...
             ...userData
             // Убедимся, что пароль есть (он должен прийти из формы)
             // password: userData.password
         };

         // Убираем поля, которые не должны быть на верхнем уровне, если они пустые
         // (Пример: очистка, если нужно)
         // if (!newUser.steamId) delete newUser.steamId;

          // Преобразуем строки с запятыми в массивы (пример для языков)
         if (typeof newUser.languages === 'string') {
             newUser.languages = newUser.languages.split(',').map(s => s.trim()).filter(Boolean);
         }
         // !!! По аналогии нужно обработать preferredGenres, lookingFor, voiceChatPlatforms, topGames !!!

         users.push(newUser);
         saveUsersToStorage(users);
         console.log(`Auth: Пользователь '${newUser.username}' успешно зарегистрирован в localStorage.`);

         // Сразу логиним пользователя после регистрации
         localStorage.setItem('loggedInUser', newUser.username);

         return { success: true, message: 'Регистрация успешна!' };
     };

    window.isAuthReady = true;
    console.log("Auth: Система аутентификации (localStorage) готова.");
}

document.addEventListener('DOMContentLoaded', initAuth);