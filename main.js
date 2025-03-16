fetch("./database.json")
    .then(response => response.json())
    .then(db => {
        const main = document.getElementById("main");

        const cleanUsername = (username) => username.replace(/#\d{4}$/, "");

        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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

            main.insertAdjacentHTML("beforeend", `
                <div class="user-card" data-user-id="${user.id}">
                    <img src="${user.avatar}" alt="Аватар ${user.username}">
                    <div class="user-info">
                        <h2 class="${statusClass}">${cleanUsername(user.username)}, ${user.age} ${statusIcon}</h2>
                        <p><strong>${user.realName}</strong> — Уровень игры ${user.skillLevel}</p>
                        <p>${user.description}</p>
                        ${topGames}
                        ${location}
                        ${languages}
                        ${voiceChat}
                    </div>
                    <div class="actions">
                        <button class="dislike" title="Не нравится"><i class="fas fa-times"></i></button>
                        <button class="like" title="Нравится"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
            `);
        };

        // Рендеринг всех пользователей
        db.users.forEach(user => renderUser(user.id));

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