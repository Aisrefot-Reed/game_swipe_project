const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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

    const statusClass = user.status === "online" ? "modalStatusOnline" : 
                        user.status === "offline" ? "modalStatusOffline" : 
                        "modalStatusAway";
    
    const statusText = user.status === "online" ? "онлайн" : 
                      user.status === "offline" ? "офлайн" : 
                      "не в сети";

    modalBody.innerHTML = `
        <div class="modalProfile">
            <div class="modalProfileHeader">
                <img src="${user.avatar || './assets/img/default-avatar.png'}" alt="${user.username}'s avatar" class="modalUserAvatar">
                <div class="modalUserInfo">
                    <h2 class="modalUserName">${user.username} <span class="modalUserRealName">(${user.realName || 'Имя не указано'})</span></h2>
                    <p class="modalUserDetails">Возраст: ${user.age || 'Не указан'}</p>
                    <p class="modalUserDetails">Город: ${user.location || 'Не указан'}</p>
                    <p class="modalUserDetails">Статус: <span class="modalUserStatus ${statusClass}">${statusText}</span></p>
                </div>
            </div>

            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-info-circle"></i> О себе</h3>
                <div class="modalSectionContent">
                    <p>${user.description || 'Описание отсутствует.'}</p>
                </div>
            </div>

            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-translate"></i> Языки</h3>
                <div class="modalSectionContent">
                    <p>${user.languages?.length ? user.languages.join(", ") : 'Не указаны'}</p>
                </div>
            </div>

            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-joystick"></i> Предпочтения</h3>
                <div class="modalSectionContent">
                    <p><strong>Жанры:</strong> ${user.preferredGenres?.length ? user.preferredGenres.join(", ") : 'Не указаны'}</p>
                    <p><strong>Роль:</strong> ${user.preferredRole || 'Не указана'}</p>
                    <p><strong>Уровень:</strong> ${user.skillLevel || 'Не указан'}</p>
                    <p><strong>Ищу:</strong> ${user.lookingFor?.length ? user.lookingFor.join(", ") : 'Не указано'}</p>
                </div>
            </div>

            ${user.topGames?.length ? `
            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-controller"></i> Топ игры</h3>
                <div class="modalSectionContent">
                    <ul class="modalGameList">
                        ${user.topGames.map(game => `<li>${game.name} — ${formatNumber(game.playtime)} часов</li>`).join("")}
                    </ul>
                </div>
            </div>` : ''}

            ${user.steam ? `
            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-steam"></i> Steam</h3>
                <div class="modalSectionContent">
                    <p><strong>Steam ID:</strong> ${user.steam.steamId || 'Не указан'}</p>
                    <p><strong>Уровень:</strong> ${user.steam.steamLevel || 'Не указан'}</p>
                    <p><strong>Всего часов:</strong> ${user.steam.totalPlaytime ? formatNumber(user.steam.totalPlaytime) : 'Нет данных'}</p>
                    ${user.steam.recentlyPlayed?.length ? `
                        <h4>Недавно играл:</h4>
                        <ul class="modalGameList">
                            ${user.steam.recentlyPlayed.map(game => `<li>${game.name} (${formatNumber(game.playtime)} ч.)</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>` : ''}

            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-calendar-week"></i> Расписание</h3>
                <div class="modalSectionContent">
                    <p><strong>Будни:</strong> ${user.schedule?.weekdays?.join(", ") || 'Не указано'}</p>
                    <p><strong>Выходные:</strong> ${user.schedule?.weekends?.join(", ") || 'Не указано'}</p>
                </div>
            </div>

            <div class="modalSection">
                <h3 class="modalSectionTitle"><i class="bi bi-mic"></i> Голосовой чат</h3>
                <div class="modalSectionContent">
                    <p>${user.voiceChat ? 'Использую' : 'Не использую'}</p>
                    ${user.voiceChat && user.voiceChatPlatforms?.length ? `<p>Платформы: ${user.voiceChatPlatforms.join(", ")}</p>` : ''}
                    ${user.discordTag ? `<p>Discord: ${user.discordTag}</p>` : ''}
                </div>
            </div>

            <button class="modalLikeButton">Лайк</button>
            <button class="modalDislikeButton">Дизлайк</button>
        </div>
    `;

    const closeButton = oModal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    } else {
        console.error("Кнопка закрытия в модалке не найдена");
    }

    const likeButton = modalBody.querySelector('.modalLikeButton');
    if (likeButton) {
        likeButton.addEventListener('click', () => {
            console.log('Пользователь поставил лайк:', user.username);
            
            // Получаем текущие лайки пользователя
            const userLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
            
            // Проверяем, не лайкал ли уже этого пользователя
            const alreadyLiked = userLikes.some(like => like.userId === user.id);
            
            if (!alreadyLiked) {
                // Добавляем новый лайк с временной меткой
                const newLike = {
                    userId: user.id,
                    username: user.username,
                    timestamp: new Date().toISOString()
                };
                
                userLikes.push(newLike);
                localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(userLikes));
                
                // Проверяем взаимный лайк
                const otherUserLikes = JSON.parse(localStorage.getItem(`likes_${user.username}`) || '[]');
                const isMutual = otherUserLikes.some(like => like.userId === currentUser.id);
                
                if (isMutual) {
                    Toastify({
                        text: `У вас взаимная симпатия с ${user.username}!`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "success"
                    }).showToast();
                } else {
                    Toastify({
                        text: `Вы поставили лайк пользователю ${user.username}`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "success"
                    }).showToast();
                }
                
                // Закрываем модальное окно
                oModal.style.display = 'none';
            } else {
                Toastify({
                    text: `Вы уже поставили лайк пользователю ${user.username}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    className: "info"
                }).showToast();
            }
        });
    }
    
    const dislikeButton = modalBody.querySelector('.modalDislikeButton');
    if (dislikeButton) {
        dislikeButton.addEventListener('click', () => {
            console.log('Пользователь поставил дизлайк:', user.username);
            
            // Получаем текущие дизлайки пользователя
            const userDislikes = JSON.parse(localStorage.getItem(`dislikes_${loggedInUser}`) || '[]');
            
            // Проверяем, не дизлайкал ли уже этого пользователя
            const alreadyDisliked = userDislikes.some(dislike => dislike.userId === user.id);
            
            if (!alreadyDisliked) {
                // Добавляем новый дизлайк с временной меткой
                const newDislike = {
                    userId: user.id,
                    username: user.username,
                    timestamp: new Date().toISOString()
                };
                
                userDislikes.push(newDislike);
                localStorage.setItem(`dislikes_${loggedInUser}`, JSON.stringify(userDislikes));
                
                // Удаляем лайк, если он был
                const userLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
                const updatedLikes = userLikes.filter(like => like.userId !== user.id);
                localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(updatedLikes));
                
                Toastify({
                    text: `Вы поставили дизлайк пользователю ${user.username}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    className: "error"
                }).showToast();
                
                // Закрываем модальное окно
                oModal.style.display = 'none';
            } else {
                Toastify({
                    text: `Вы уже поставили дизлайк пользователю ${user.username}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    className: "info"
                }).showToast();
            }
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

async function renderUserCards() {
    const main = document.getElementById('main');
    if (!main) return;

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        main.innerHTML = `
            <div class="unauthorized-container">
                <h2>Для просмотра пользователей необходимо войти</h2>
                <a href="./login/emailLogin.html" class="btn btn-primary">Войти</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch("./database.json");
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const db = await response.json();

        // Получаем текущие лайки и дизлайки пользователя
        const userLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
        const userDislikes = JSON.parse(localStorage.getItem(`dislikes_${loggedInUser}`) || '[]');

        // Фильтруем пользователей
        const filteredUsers = db.users.filter(user => {
            // Пропускаем текущего пользователя
            if (user.username === loggedInUser) {
                console.log("Пропускаем рендеринг текущего пользователя:", loggedInUser);
                return false;
            }

            // Пропускаем дизлайкнутых пользователей
            if (userDislikes.some(dislike => dislike.userId === user.id)) {
                console.log("Пропускаем дизлайкнутого пользователя:", user.username);
                return false;
            }

            return true;
        });

        console.log("Рендерим карточки пользователей:", filteredUsers);

        // Очищаем контейнер
        main.innerHTML = '';

        // Создаем карточки для каждого пользователя
        filteredUsers.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'userCard';
            userCard.id = user.id;
            
            // Проверяем, лайкнут ли пользователь
            const isLiked = userLikes.some(like => like.userId === user.id);
            
            userCard.innerHTML = `
                <img src="${user.avatar}" alt="${user.username}" class="userAvatar">
                <h3 class="userName">${user.username}</h3>
                <p class="aBitGray">Возраст: ${user.age}</p>
                <div class="userLastLine">
                    <span class="aBitGray status-${user.status}">${user.status === 'online' ? 'онлайн' : 'офлайн'}</span>
                    <div class="user-actions">
                        <button class="like ${isLiked ? 'active' : ''}" title="Лайк">
                            <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i>
                        </button>
                        <button class="dislike" title="Дизлайк">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            `;

            // Добавляем обработчики для кнопок
            const likeButton = userCard.querySelector('.like');
            const dislikeButton = userCard.querySelector('.dislike');

            likeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!loggedInUser) {
                    Toastify({
                        text: "Для лайков необходимо войти в систему",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "error"
                    }).showToast();
                    return;
                }

                const currentLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
                const alreadyLiked = currentLikes.some(like => like.userId === user.id);

                if (!alreadyLiked) {
                    const newLike = {
                        userId: user.id,
                        timestamp: new Date().toISOString()
                    };
                    currentLikes.push(newLike);
                    localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(currentLikes));

                    // Обновляем внешний вид кнопки
                    likeButton.classList.add('active');
                    likeButton.querySelector('i').classList.replace('bi-heart', 'bi-heart-fill');

                    // Проверяем взаимный лайк
                    const otherUserLikes = JSON.parse(localStorage.getItem(`likes_${user.username}`) || '[]');
                    const isMutual = otherUserLikes.some(l => l.userId === loggedInUser);

                    if (isMutual) {
                        Toastify({
                            text: `У вас взаимная симпатия с ${user.username}!`,
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            className: "success"
                        }).showToast();
                    } else {
                        Toastify({
                            text: `Вы поставили лайк пользователю ${user.username}`,
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            className: "success"
                        }).showToast();
                    }
                } else {
                    // Убираем лайк
                    const updatedLikes = currentLikes.filter(like => like.userId !== user.id);
                    localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(updatedLikes));

                    // Обновляем внешний вид кнопки
                    likeButton.classList.remove('active');
                    likeButton.querySelector('i').classList.replace('bi-heart-fill', 'bi-heart');

                    Toastify({
                        text: `Вы убрали лайк у пользователя ${user.username}`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "info"
                    }).showToast();
                }
            });

            dislikeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!loggedInUser) {
                    Toastify({
                        text: "Для дизлайков необходимо войти в систему",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "error"
                    }).showToast();
                    return;
                }

                const currentDislikes = JSON.parse(localStorage.getItem(`dislikes_${loggedInUser}`) || '[]');
                const alreadyDisliked = currentDislikes.some(dislike => dislike.userId === user.id);

                if (!alreadyDisliked) {
                    const newDislike = {
                        userId: user.id,
                        timestamp: new Date().toISOString()
                    };
                    currentDislikes.push(newDislike);
                    localStorage.setItem(`dislikes_${loggedInUser}`, JSON.stringify(currentDislikes));

                    // Удаляем лайк, если он был
                    const currentLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
                    const updatedLikes = currentLikes.filter(like => like.userId !== user.id);
                    localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(updatedLikes));

                    // Скрываем карточку пользователя
                    userCard.style.display = 'none';

                    Toastify({
                        text: `Вы больше не будете видеть пользователя ${user.username}`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "info"
                    }).showToast();
                }
            });

            // Добавляем обработчик для открытия модалки
            userCard.addEventListener('click', () => {
                openModal(user);
            });

            main.appendChild(userCard);
        });

    } catch (error) {
        console.error('Ошибка:', error);
        main.innerHTML = '<p class="error-message">Не удалось загрузить пользователей. Попробуйте позже.</p>';
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', renderUserCards);
