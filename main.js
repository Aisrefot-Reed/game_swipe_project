const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Определяем функции перед их использованием
function openModal(user) {
    const oMain = document.querySelector("#main");
    const oModal = document.querySelector(".modal");

    if (!oMain || !oModal) {
        console.error("Не найдены элементы main или modal");
        return;
    }

    oModal.classList.add("opened");
    oMain.classList.add("closed");

    const modalBody = oModal.querySelector(".modalBody");
    if (!modalBody) {
        console.error("Не найден элемент .modalBody");
        return;
    }

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
            <button class="btn btn-primary like" title="Лайк">Лайк</button>
        </div>
    `;

    const closeButton = oModal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    } else {
        console.error("Кнопка закрытия в модалке не найдена");
    }

    const likeButton = modalBody.querySelector('.like');
    if (likeButton) {
        likeButton.addEventListener('click', () => {
            console.log(`Пользователь ${user.username} понравился!`);
            closeModal();
        });
    }
}

function closeModal() {
    const oMain = document.querySelector("#main");
    const oModal = document.querySelector(".modal");

    if (!oMain || !oModal) {
        console.error("Не найдены элементы main или modal при закрытии");
        return;
    }

    oModal.classList.remove("opened");
    oMain.classList.remove("closed");
}

document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        alert('Пожалуйста, войдите в систему.');
        window.location.href = './login/emailLogin.html';
        return;
    }

    console.log("Текущий пользователь:", loggedInUser);

    let db;
    try {
        const response = await fetch("./database.json");
        db = await response.json();
    } catch (error) {
        console.error("Ошибка загрузки JSON:", error);
        return;
    }

    const main = document.getElementById("main");
    if (!main) {
        console.error("Элемент с id='main' не найден");
        return;
    }

    const cleanUsername = (username) => username.replace(/#\d{4}$/, "");
    const userCards = [];

    const renderUser = (userId) => {
        const user = db.users.find(u => u.id === userId);
        if (!user) {
            console.error(`Пользователь с ID ${userId} не найден`);
            return;
        }
        if (user.username === loggedInUser) {
            console.log(`Пропускаем рендеринг текущего пользователя: ${loggedInUser}`);
            return;
        }

        const statusClass = user.status === "online" ? "status-online" :
                            user.status === "offline" ? "status-offline" : "status-away";
        const statusIcon = user.status === "online" ? "🟢" :
                           user.status === "offline" ? "🔴" : "🟡";

        const topGames = user.topGames?.length ? `
            <div class="section-title">🎮 Топ игры:</div>
            <ul class="game-list">
                ${user.topGames.slice(0, 3).map(game => `<li>${game.name} — ${formatNumber(game.playtime)} часов</li>`).join("")}
            </ul>
        ` : "";

        const languages = user.languages?.length ? `<p>Языки🗣 ${user.languages.join(", ")}</p>` : "";
        const location = user.location ? `<p>Город📍 ${user.location}</p>` : "";
        const voiceChat = user.voiceChat ? `<p>Войс-чаты🎙 ${user.voiceChatPlatforms.join(", ")}</p>` : "";

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
        console.log("Рендерим карточки пользователей:", userCards);
        userCards.forEach(userCard => {
            main.insertAdjacentHTML("beforeend", `
                <div class="userCard" id="${userCard.userId}" data-user-id="${userCard.userId}">
                    <img src="${userCard.avatar}" alt="${userCard.username}'s avatar" class="userAvatar">
                    <p class="userName">${userCard.username}</p>
                    <p class="userAge aBitGray">Возраст: ${userCard.age}</p>
                    <div class="userLastLine">
                        <p class="${userCard.statusClass} aBitGray">${userCard.statusClass === 'status-online' ? 'онлайн' : 'офлайн'}</p>
                        <button class="btn btn-primary like" title="Лайк">Лайк</button>
                    </div>
                </div>
            `);
        });
    };

    db.users.forEach(user => renderUser(user.id));
    renderUserCards();

    // Обработчик кликов по карточкам
    document.addEventListener("click", (e) => {
        const card = e.target.closest(".userCard");
        const likeButton = e.target.closest(".like");

        if (likeButton) {
            console.log("Клик по кнопке Лайк");
            return;
        }

        if (card) {
            const userId = card.dataset.userId;
            const user = db.users.find(u => u.id === userId);
            if (user) {
                console.log(`Открываем модалку для ${user.username}`);
                openModal(user);
            } else {
                console.error(`Пользователь с ID ${userId} не найден в db`);
            }
        }
    });
});
