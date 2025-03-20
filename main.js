const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        alert('Пожалуйста, войдите в систему.');
        window.location.href = './login/emailLogin.html'; // Перенаправление на страницу входа
        return;
    }

    // Загрузка данных пользователей из database.json
    fetch("./database.json")
        .then(response => response.json())
        .then(db => {
            const main = document.getElementById("main");

            const cleanUsername = (username) => username.replace(/#\d{4}$/, "");

            const userCards = []; // Массив для хранения карточек пользователей

            const renderUser = (userId) => {
                const user = db.users.find(u => u.id === userId);
                if (!user) {
                    console.error(`Пользователь с ID ${userId} не найден`);
                    return;
                }

                const statusClass = user.status === "online" ? "status-online" :
                                    user.status === "offline" ? "status-offline" : "status-away";
                const statusIcon = user.status === "online" ? "🟢" :
                                   user.status === "offline" ? "🔴" : "🟡";

                const topGames = user.topGames?.length ? `
                    <div class="section-title">🎮 Топ игры:</div>
                    <ul class="game-list">
                        ${user.topGames.slice(0, 3).map(game => `<li>${game.name} — ${formatNumber(game.playtime)} hours</li>`).join("")}
                    </ul>
                ` : "";

                const languages = user.languages?.length ? `<p>Языки🗣 ${user.languages.join(", ")}</p>` : "";
                const location = user.location ? `<p>Город📍 ${user.location}</p>` : "";
                const voiceChat = user.voiceChat ? `<p>Войс-чаты🎙 ${user.voiceChatPlatforms.join(", ")}</p>` : "";

                // Сохраняем карточку пользователя в массив
                userCards.push({
                    userId: user.id,
                    avatar: user.avatar,
                    username: cleanUsername(user.username),
                    age: user.age,
                    statusClass: statusClass,
                    statusIcon: statusIcon,
                    realName: user.realName,
                    skillLevel: user.skillLevel,
                    description: user.description,
                    topGames: topGames,
                    location: location,
                    languages: languages,
                    voiceChat: voiceChat
                });
            };

            const renderUserCards = () => {
                userCards.forEach(userCard => {
                    main.insertAdjacentHTML("beforeend", `
                        <div class="userCard" id="${userCard.userId}" data-user-id="${userCard.userId}">
                            <img src="${userCard.avatar}" alt="${userCard.username}'s avatar" class="userAvatar">
                            <p class="userName">${userCard.username}</p>
                            <p class="userAge aBitGray">Age: ${userCard.age}</p>
                            <div class="userLastLine">
                                <p class="${userCard.statusClass} aBitGray"><!--${userCard.statusIcon} --> ${userCard.statusClass === 'status-online' ? 'online' : 'offline'}</p>
                                <button class="btn btn-primary like" title="Like">Лайк</button>
                            </div>
                        </div>
                    `);
                });
            };

            // Рендеринг всех пользователей
            db.users.forEach(user => renderUser(user.id));

            // Вызов функции рендеринга карточек пользователей
            renderUserCards();

            // Обработчики событий
            document.addEventListener("click", (e) => {
                const card = e.target.closest(".userCard");
                const likeButton = e.target.closest(".like"); // Проверяем, был ли клик на кнопке "Лайк"

                if (likeButton) {
                    // Если кликнули на кнопку "Лайк", ничего не делаем
                    return;
                }

                if (card) {
                    const userId = card.dataset.userId;
                    openModal(db.users.find(u => u.id === userId)); // Открываем модальное окно при клике на карточку
                }
            });

            document.querySelector('.bi-xii').addEventListener('click', closeModal);
        })
        .catch(error => console.error("Ошибка загрузки JSON:", error));
});

function openModal(user) {
    let oMain = document.querySelector("#main");
    let oModal = document.querySelector(".modal");
    oModal.classList.add("opened");
    oMain.classList.add("closed");

    const modalBody = oModal.querySelector(".modalBody");
    modalBody.innerHTML = `
        <div class="modalContent">
            <img src="${user.avatar}" alt="${user.username}'s avatar" class="userAvatar" style="max-height: 150px;">
            <h2>${user.username}</h2>
            <p><strong>Реальное имя:</strong> ${user.realName}</p>
            <p><strong>Возраст:</strong> ${user.age}</p>
            <p><strong>Город:</strong> ${user.location}</p>
            <p><strong>Описание:</strong> ${user.description}</p>
            <p><strong>Языки:</strong> ${user.languages.join(", ")}</p>
            <div class="topGames">
                <h3>Топ игры:</h3>
                <ul>
                    ${user.topGames.map(game => `<li>${game.name} — ${formatNumber(game.playtime)} часов</li>`).join("")}
                </ul>
            </div>
            <div class="schedule">
                <h3>Расписание:</h3>
                <p><strong>Будни:</strong> ${user.schedule.weekdays.join(", ")}</p>
                <p><strong>Выходные:</strong> ${user.schedule.weekends.join(", ")}</p>
            </div>
            <button class="btn btn-primary like" title="Like">Лайк</button> <!-- Кнопка лайка -->
        </div>
    `;

    // Привязка обработчика события для кнопки "Назад"
    const closeButton = oModal.querySelector('.close-button');
    closeButton.addEventListener('click', closeModal);

    // Привязка обработчика события для кнопки "Лайк"
    const likeButton = modalBody.querySelector('.like');
    likeButton.addEventListener('click', () => {
        console.log(`Пользователь ${user.username} понравился!`);
        closeModal(); // Закрываем модалку после лайка (по желанию)
    });
}

function closeModal() {
    let oMain = document.querySelector("#main");
    let oModal = document.querySelector(".modal");
    oModal.classList.remove("opened");
    oMain.classList.remove("closed");
}

function login(username, password) {
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
    return true;
}

// Пример вызова функции входа
const usernameInput = "CyberNinja"; // Получите это значение из формы
const passwordInput = "123"; // Получите это значение из формы
login(usernameInput, passwordInput);
