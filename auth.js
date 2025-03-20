// auth.js
async function initAuth() {
    let db;
    try {
        const response = await fetch("../database.json"); // Убедитесь, что путь правильный
        db = await response.json();
    } catch (error) {
        console.error("Ошибка загрузки JSON:", error);
        return;
    }

    window.login = function(username, password) {
        const user = db.users.find(u => u.username === username);
        if (!user) {
            console.error("Пользователь не найден");
            return false;
        }
        if (user.password !== password) {
            console.error("Неверный пароль");
            return false;
        }
        console.log("Успешный вход!");
        localStorage.setItem('loggedInUser', username);
        return true;
    };
}

document.addEventListener('DOMContentLoaded', initAuth);