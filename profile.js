// profile.js

// Функция для форматирования чисел (возьмем из main.js)
const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const mainContent = document.getElementById('main');

    if (!mainContent) {
        console.error("Элемент #main не найден на странице профиля.");
        return;
    }

    // 1. Проверка авторизации
    if (!loggedInUser) {
        alert('Пожалуйста, войдите в систему.');
        // Очищаем main и показываем сообщение или сразу редиректим
        mainContent.innerHTML = '<p>Пожалуйста, <a href="./login/emailLogin.html">войдите в систему</a> для просмотра профиля.</p>';
        // Можно добавить задержку перед редиректом
        // setTimeout(() => { window.location.href = './login/emailLogin.html'; }, 2000);
        return; // Прерываем выполнение, если пользователь не вошел
    }

    console.log("Загрузка профиля для:", loggedInUser);

    // 2. Загрузка данных пользователя
    let db;
    try {
        const response = await fetch("./database.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        db = await response.json();
    } catch (error) {
        console.error("Ошибка загрузки JSON:", error);
        mainContent.innerHTML = '<p>Не удалось загрузить данные пользователя. Попробуйте позже.</p>';
        return;
    }

    // 3. Поиск текущего пользователя в базе данных
    const currentUser = db.users.find(u => u.username === loggedInUser);

    if (!currentUser) {
        console.error(`Пользователь ${loggedInUser} не найден в database.json!`);
        mainContent.innerHTML = '<p>Ошибка: Данные пользователя не найдены.</p>';
        // Возможно, стоит очистить localStorage и отправить на логин
        // localStorage.removeItem('loggedInUser');
        // window.location.href = './login/emailLogin.html';
        return;
    }

    // 4. Рендеринг данных пользователя
    console.log("Данные пользователя:", currentUser);
    renderUserProfile(currentUser, mainContent);
});

function renderUserProfile(user, container) {
    // Очищаем предыдущее содержимое (например, сообщение "Загрузка...")
    container.innerHTML = '';

    // Формируем HTML для отображения профиля
    const profileHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <img src="${user.avatar || './assets/img/default-avatar.png'}" alt="Аватар ${user.username}" class="profile-avatar">
                <div class="profile-header-info">
                    <h2>${user.username} <span class="aBitGray">(${user.realName || 'Имя не указано'})</span></h2>
                    <p class="aBitGray">Возраст: ${user.age || 'Не указан'}</p>
                    <p class="aBitGray">Город: ${user.location || 'Не указан'}</p>
                    <p>Статус: <span class="${user.status === 'online' ? 'status-online' : user.status === 'offline' ? 'status-offline' : 'status-away'}">
                        ${user.status || 'Неизвестно'}
                    </span></p>
                </div>
                 <button class="btn btn-secondary btn-sm edit-profile-button" title="Редактировать профиль"><i class="bi bi-pencil"></i></button>
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

    // Добавляем обработчик для кнопки выхода
    const logoutButton = container.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Выход из аккаунта...");
            logoutButton.disabled = true; // Блокируем кнопку
            localStorage.removeItem('loggedInUser');

            // Показываем тост вместо старого сообщения
             Toastify({
                text: "Вы вышли из системы. Перенаправление...",
                duration: 2000,
                gravity: "bottom",
                position: "center",
                backgroundColor: "linear-gradient(to right, #6a11cb, #2575fc)", // Фиолетово-синий для инфо
                 callback: function() {
                    window.location.href = './login/emailLogin.html';
                }
            }).showToast();
        });
    }

     // Добавляем обработчик для кнопки редактирования
     const editButton = container.querySelector('.edit-profile-button');
     if (editButton) {
         // Вместо alert можно добавить title или просто ничего не делать,
         // пока функционал не готов. Можно ее даже скрыть или сделать disabled.
         // editButton.disabled = true; // Делаем кнопку неактивной
         editButton.title = 'Редактирование профиля пока не доступно'; // Подсказка при наведении

        editButton.addEventListener('click', () => {
            // alert('Функция редактирования профиля пока не реализована.'); // Убрано
            console.log('Клик по кнопке редактирования (не реализовано)');
             // Можно показать небольшое всплывающее сообщение рядом с кнопкой, если нужно
        });
    }
}
