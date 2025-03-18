fetch("./database.json")
    .then(response => response.json())
    .then(db => {
        const main = document.getElementById("main");

        const cleanUsername = (username) => username.replace(/#\d{4}$/, "");

        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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

            // Убираем рендеринг
        };

        const renderUserCards = () => {
            userCards.forEach(userCard => {
                main.insertAdjacentHTML("beforeend", `
                    <div class="userCard">
                        <img src="${userCard.avatar}" alt="${userCard.username}'s avatar" class="userAvatar">
                        <p class="userName">${userCard.username}</p>
                        <p class="userAge aBitGray">Age: ${userCard.age}</p>
                        <div class="userLastLine">
                            <p class="${userCard.statusClass} aBitGray"><!--${userCard.statusIcon} --> ${userCard.statusClass === 'status-online' ? 'online' : 'offline'}</p>
                            <button class="btn btn-primary like" title="Like">Like</button>
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
            const button = e.target.closest("button");
            if (!button) return;

            const card = button.closest(".user-card");
            const userId = card.dataset.userId;

            if (button.classList.contains("like")) {
                console.log(`Пользователь ${userId} понравился!`);
            } else if (button.classList.contains("dislike")) {
                console.log(`Пользователь ${userId} не понравился!`);
            }
        });
    })
    .catch(error => console.error("Ошибка загрузки JSON:", error));