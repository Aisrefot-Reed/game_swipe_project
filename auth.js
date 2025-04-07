const STORAGE_KEY = 'appUsers';

function getUsersFromStorage() {
    try {
        const usersJson = localStorage.getItem(STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
        return [];
    }
}

function saveUsersToStorage(users) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
    }
}

window.isAuthReady = false;

async function initAuth() {
    let initialUsers = [];
    const storedUsers = getUsersFromStorage();

    if (storedUsers.length === 0) {
        try {
            const response = await fetch("../database.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const db = await response.json();
            initialUsers = db.users || [];
            saveUsersToStorage(initialUsers);
        } catch (error) {
             saveUsersToStorage([]);
        }
    } else {
         initialUsers = storedUsers;
    }

    window.login = function(username, password) {
        const users = getUsersFromStorage();
        const user = users.find(u => u.username === username);

        if (!user) {
            return { success: false, message: "Пользователь с таким именем не найден." };
        }
        if (user.password !== password) {
            return { success: false, message: "Неверный пароль." };
        }

        localStorage.setItem('loggedInUser', username);
        return { success: true };
    };

     window.register = function(userData) {
         const users = getUsersFromStorage();

         if (users.some(u => u.username === userData.username)) {
             return { success: false, message: 'Пользователь с таким именем уже существует!' };
         }

         const newUser = {
             id: `user${Date.now()}`,
             status: "offline",
             avatar: userData.avatar || "./assets/img/default-avatar.png",
             emailUser: false,
             ...userData
         };

         if (typeof newUser.languages === 'string') {
             newUser.languages = newUser.languages.split(',').map(s => s.trim()).filter(Boolean);
         }

         users.push(newUser);
         saveUsersToStorage(users);

         localStorage.setItem('loggedInUser', newUser.username);

         return { success: true, message: 'Регистрация успешна!' };
     };

    window.isAuthReady = true;
}

document.addEventListener('DOMContentLoaded', initAuth);