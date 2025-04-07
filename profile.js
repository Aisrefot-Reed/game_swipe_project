const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

let mainContent = null;
let authScriptLoaded = false;
let editModal = null;

function openEditModal(userData) {
    if (!editModal) {
        editModal = document.querySelector('.edit-modal');
    }
    userCurrData

    editModal.classList.add('opened');
    document.body.style.overflow = 'hidden';
}

function userCurrData(){
    document.getElementById('editRealName').value = userData.realName || '';
    document.getElementById('editAge').value = userData.age || '';
    document.getElementById('editLocation').value = userData.location || '';
    document.getElementById('editDescription').value = userData.description || '';
    document.getElementById('editLanguages').value = userData.languages?.join(', ') || '';
    document.getElementById('editPreferredGenres').value = userData.preferredGenres?.join(', ') || '';
    document.getElementById('editPreferredRole').value = userData.preferredRole || '';
    document.getElementById('editSkillLevel').value = userData.skillLevel || '';
    document.getElementById('editScheduleWeekdays').value = userData.schedule?.weekdays?.join(', ') || '';
    document.getElementById('editScheduleWeekends').value = userData.schedule?.weekends?.join(', ') || '';
    document.getElementById('editDiscordTag').value = userData.discordTag || '';
}

function closeEditModal() {
    if (!editModal) {
        editModal = document.querySelector('.edit-modal');
    }
    editModal.classList.remove('opened');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', async () => {
    mainContent = document.getElementById('main');
    editModal = document.querySelector('.edit-modal');
    const editForm = document.getElementById('editProfileForm');
    const editButton = document.querySelector('.edit-profile-button');
    const closeButton = document.querySelector('.edit-modal-close');
    const cancelButton = document.querySelector('.edit-form-cancel');

    if (!mainContent) {
        console.error("Элемент #main не найден на странице профиля.");
        return;
    }

    const loggedInUser = localStorage.getItem('loggedInUser');
    await renderPageContent(loggedInUser, mainContent);

    if (editButton) {
        editButton.addEventListener('click', async () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (!loggedInUser) {
                console.error('Пользователь не авторизован');
                return;
            }

            try {
                const response = await fetch("./database.json");
                if (!response.ok) throw new Error('Ошибка загрузки данных');
                const db = await response.json();
                const userData = db.users.find(u => u.username === loggedInUser);
                if (userData) {
                    openEditModal(userData);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                Toastify({
                    text: "Не удалось загрузить данные профиля",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    className: "error"
                }).showToast();
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeEditModal);
    }
    if (cancelButton) {
        cancelButton.addEventListener('click', closeEditModal);
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editForm);
            const updatedData = {};

            for (const [key, value] of formData.entries()) {
                if (value) {
                    switch (key) {
                        case 'languages':
                        case 'preferredGenres':
                            updatedData[key] = value.split(',').map(item => item.trim()).filter(Boolean);
                            break;
                        case 'scheduleWeekdays':
                        case 'scheduleWeekends':
                            if (!updatedData.schedule) updatedData.schedule = {};
                            updatedData.schedule[key.replace('schedule', '').toLowerCase()] = 
                                value.split(',').map(item => item.trim()).filter(Boolean);
                            break;
                        default:
                            updatedData[key] = value;
                    }
                }
            }

            try {
                const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
                const loggedInUser = localStorage.getItem('loggedInUser');
                const userIndex = users.findIndex(u => u.username === loggedInUser);

                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...updatedData };
                    localStorage.setItem('appUsers', JSON.stringify(users));

                    Toastify({
                        text: "Профиль успешно обновлен!",
                        duration: 3000,
                        gravity: "bottom",
                        position: "center",
                        className: "success"
                    }).showToast();

                    closeEditModal();
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                console.error('Ошибка при сохранении:', error);
                Toastify({
                    text: "Не удалось сохранить изменения",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    className: "error"
                }).showToast();
            }
        });
    }
});

async function renderPageContent(loggedInUser, container) {
    if (!loggedInUser) {
        renderUnauthorized(container);
        return;
    }

    console.log("Загрузка профиля для:", loggedInUser);

    let db;
    try {
        const response = await fetch("./database.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        db = await response.json();
    } catch (error) {
        console.error("Ошибка загрузки JSON:", error);
        container.innerHTML = '<p>Не удалось загрузить данные пользователя. Попробуйте позже.</p>';
        return;
    }

    const currentUser = db.users.find(u => u.username === loggedInUser);
    if (!currentUser) {
        console.error(`Пользователь ${loggedInUser} не найден в database.json!`);
        renderUnauthorized(container, true);
        return;
    }

    renderUserProfile(currentUser, container);
}

function renderUnauthorized(container, error = false) {
    container.innerHTML = `
        <div class="text-center mt-5">
            ${error ? '<p class="text-danger">Ошибка: Пользователь не найден. Возможно, сессия устарела.</p>' : ''}
            <p>Пожалуйста, <a href="./login/emailLogin.html" class="text-primary">войдите в систему</a> для просмотра профиля.</p>
        </div>
    `;
}

function renderLoginForm(container) {
    container.innerHTML = `
        <div class="loginBox p-4 mx-auto" style="max-width: 400px;">
            <h2 class="text-center mb-4">Вход</h2>
            <form id="inlineLoginForm">
                <div class="form-group mb-3">
                    <label for="username">Имя пользователя:</label>
                    <input type="text" id="username" name="username" class="form-control" required>
                </div>
                <div class="form-group mb-3">
                    <label for="password">Пароль:</label>
                    <input type="password" id="password" name="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Войти</button>
            </form>
            <p class="text-center mt-3"><a href="./login/email.html" class="text-primary">Зарегистрироваться</a></p>
        </div>
    `;

    if (!authScriptLoaded) {
        const authScript = document.createElement('script');
        authScript.src = './auth.js';
        authScript.onload = () => {
            authScriptLoaded = true;
            console.log("Auth.js загружен");
        };
        document.head.appendChild(authScript);
    }

    const loginForm = container.querySelector('#inlineLoginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = loginForm.querySelector('#username').value;
        const password = loginForm.querySelector('#password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const maxWaitTime = 5000;
        const startTime = Date.now();
        
        while (!window.isAuthReady && (Date.now() - startTime) < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!window.isAuthReady) {
            Toastify({
                text: "Ошибка инициализации. Попробуйте позже.",
                duration: 5000,
                gravity: "top",
                position: "center",
                className: "error"
            }).showToast();
            submitButton.disabled = false;
            return;
        }

        const result = window.login(username, password);
        if (result.success) {
            localStorage.setItem('loggedInUser', username);
            await renderPageContent(username, container);
            Toastify({
                text: "Успешный вход!",
                duration: 2000,
                gravity: "bottom",
                position: "center",
                className: "success"
            }).showToast();
        } else {
            Toastify({
                text: result.message,
                duration: 4000,
                gravity: "top",
                position: "center",
                className: "error"
            }).showToast();
            submitButton.disabled = false;
        }
    });
}

function renderUserProfile(user, container) {
    const profileHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${user.avatar || './assets/img/default-avatar.png'}" alt="Avatar">
                </div>
                <div class="profile-info">
                    <h1>${user.username}</h1>
                    <p class="real-name">${user.realName || 'Имя не указано'}</p>
                    <p class="age-location">${user.age ? user.age + ' лет' : ''} ${user.location ? ' • ' + user.location : ''}</p>
                    <div class="status-indicator ${user.status || 'offline'}">
                        <span class="status-dot"></span>
                        <span class="status-text">${user.status || 'Оффлайн'}</span>
                    </div>
                </div>
                <button class="edit-profile-button">
                    <i class="bi bi-pencil"></i> Редактировать
                </button>
            </div>

            <div class="profile-section">
                <h3><i class="bi bi-info-circle"></i> О себе</h3>
                <p>${user.description || 'Описание отсутствует.'}</p>
            </div>

            <div class="profile-section">
                <h3><i class="bi bi-translate"></i> Языки</h3>
                <p>${user.languages?.length ? user.languages.join(", ") : 'Не указаны'}</p>
            </div>

            <div class="profile-section">
                <h3><i class="bi bi-joystick"></i> Предпочтения</h3>
                <p><strong>Жанры:</strong> ${user.preferredGenres?.length ? user.preferredGenres.join(", ") : 'Не указаны'}</p>
                <p><strong>Роль:</strong> ${user.preferredRole || 'Не указана'}</p>
                <p><strong>Уровень:</strong> ${user.skillLevel || 'Не указан'}</p>
                <p><strong>Ищу:</strong> ${user.lookingFor?.length ? user.lookingFor.join(", ") : 'Не указано'}</p>
            </div>

            ${user.topGames?.length ? `
            <div class="profile-section">
                <h3><i class="bi bi-controller"></i> Топ игры</h3>
                <ul class="game-list">
                    ${user.topGames.map(game => `<li>${game.name} — ${formatNumber(game.playtime)} часов</li>`).join("")}
                </ul>
            </div>` : ''}

            ${user.steam ? `
            <div class="profile-section">
                <h3><i class="bi bi-steam"></i> Steam</h3>
                <p><strong>Steam ID:</strong> ${user.steam.steamId || 'Не указан'}</p>
                <p><strong>Уровень:</strong> ${user.steam.steamLevel || 'Не указан'}</p>
                <p><strong>Всего часов:</strong> ${user.steam.totalPlaytime ? formatNumber(user.steam.totalPlaytime) : 'Нет данных'}</p>
                ${user.steam.recentlyPlayed?.length ? `
                    <h4>Недавно играл:</h4>
                    <ul class="game-list small">
                        ${user.steam.recentlyPlayed.map(game => `<li>${game.name} (${formatNumber(game.playtime)} ч.)</li>`).join('')}
                    </ul>
                ` : ''}
            </div>` : ''}

            <div class="profile-section">
                <h3><i class="bi bi-calendar-week"></i> Расписание</h3>
                <p><strong>Будни:</strong> ${user.schedule?.weekdays?.join(", ") || 'Не указано'}</p>
                <p><strong>Выходные:</strong> ${user.schedule?.weekends?.join(", ") || 'Не указано'}</p>
            </div>

            <div class="profile-section">
                <h3><i class="bi bi-mic"></i> Голосовой чат</h3>
                <p>${user.voiceChat ? 'Использую' : 'Не использую'}</p>
                ${user.voiceChat && user.voiceChatPlatforms?.length ? `<p>Платформы: ${user.voiceChatPlatforms.join(", ")}</p>` : ''}
                ${user.discordTag ? `<p>Discord: ${user.discordTag}</p>` : ''}
            </div>

            <button class="btn btn-danger logout-button">Выйти из аккаунта</button>
        </div>
    `;
    
    container.innerHTML = profileHTML;

    const logoutButton = container.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Выход из аккаунта...");
            logoutButton.disabled = true;
            localStorage.removeItem('loggedInUser');

            Toastify({
                text: "Вы вышли из системы!",
                duration: 2000,
                gravity: "bottom",
                position: "center",
                className: "success"
            }).showToast();

            setTimeout(() => renderUnauthorized(container), 500);
        });
    }

    const editButton = container.querySelector('.edit-profile-button');
    if (editButton) {
        editButton.addEventListener('click', async () => {
            try {
                const response = await fetch("./database.json");
                if (!response.ok) throw new Error('Ошибка загрузки данных');
                const db = await response.json();
                const userData = db.users.find(u => u.username === user.username);
                if (userData) {
                    openEditModal(userData);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                Toastify({
                    text: "Не удалось загрузить данные профиля",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    className: "error"
                }).showToast();
            }
        });
    }
}
