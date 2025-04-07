// Функция для проверки авторизации
function checkAuth() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = './login/emailLogin.html';
        return null;
    }
    return loggedInUser;
}

// Функция для отображения страницы для неавторизованных пользователей
function renderUnauthorized(container) {
    container.innerHTML = `
        <div class="unauthorized-container">
            <h2>Доступ запрещен</h2>
            <p>Для просмотра лайков необходимо войти в систему.</p>
            <a href="./login/emailLogin.html" class="btn btn-primary">Войти</a>
        </div>
    `;
}

// Функция для отображения лайков
async function renderLikes() {
    const main = document.getElementById('main');
    if (!main) return;

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        main.innerHTML = `
            <div class="unauthorized-container">
                <h2>Для просмотра лайков необходимо войти</h2>
                <a href="./login/emailLogin.html" class="btn btn-primary">Войти</a>
            </div>
        `;
        return;
    }

    // Получаем все лайки
    const allLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
    const otherUsersLikes = [];
    const mutualLikes = [];
    const myLikes = [];

    // Получаем лайки других пользователей
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    users.forEach(user => {
        if (user.username === loggedInUser) return;
        const userLikes = JSON.parse(localStorage.getItem(`likes_${user.username}`) || '[]');
        const likesToMe = userLikes.filter(like => like.userId === loggedInUser);
        if (likesToMe.length > 0) {
            otherUsersLikes.push({ username: user.username, ...likesToMe[0] });
            // Проверяем взаимность
            const iMutuallyLiked = allLikes.some(myLike => myLike.userId === user.id);
            if (iMutuallyLiked) {
                mutualLikes.push({ username: user.username, ...likesToMe[0] });
            }
        }
    });

    main.innerHTML = `
        <div class="likes-container">
            <section class="likes-section mutual-likes">
                <h2><i class="bi bi-heart-fill"></i> Взаимные симпатии</h2>
                ${mutualLikes.length > 0 ? `
                    <div class="likes-grid">
                        ${mutualLikes.map(user => `
                            <div class="like-card mutual" data-user-id="${user.userId}">
                                <img src="${user.avatar}" alt="${user.username}'s avatar" class="like-avatar">
                                <div class="like-info">
                                    <h3>${user.username}</h3>
                                    <p class="aBitGray">Возраст: ${user.age}</p>
                                    <p class="${user.status === 'online' ? 'status-online' : 'status-offline'} aBitGray">
                                        ${user.status === 'online' ? 'онлайн' : 'офлайн'}
                                    </p>
                                    <p class="like-date aBitGray">
                                        Лайк поставлен: ${new Date(user.timestamp).toLocaleDateString()}
                                    </p>
                                    <button class="btn btn-success chat-button" data-user-id="${user.userId}">
                                        <i class="bi bi-chat-dots"></i> Написать
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="no-likes">
                        <h3>Пока нет взаимных симпатий 💫</h3>
                        <p>Продолжайте общаться, и скоро здесь появятся ваши первые взаимные симпатии!</p>
                    </div>
                `}
            </section>

            <section class="likes-section received-likes">
                <h2><i class="bi bi-heart"></i> Вас отметили</h2>
                ${otherUsersLikes.length > 0 ? `
                    <div class="likes-grid">
                        ${otherUsersLikes.map(user => `
                            <div class="like-card liked-by" data-user-id="${user.userId}">
                                <img src="${user.avatar}" alt="${user.username}'s avatar" class="like-avatar">
                                <div class="like-info">
                                    <h3>${user.username}</h3>
                                    <p class="aBitGray">Возраст: ${user.age}</p>
                                    <p class="${user.status === 'online' ? 'status-online' : 'status-offline'} aBitGray">
                                        ${user.status === 'online' ? 'онлайн' : 'офлайн'}
                                    </p>
                                    <p class="like-date aBitGray">
                                        Лайк поставлен: ${new Date(user.timestamp).toLocaleDateString()}
                                    </p>
                                    <div class="like-actions">
                                        <button class="btn btn-success like-button" data-user-id="${user.userId}">
                                            <i class="bi bi-heart-fill"></i> Лайк
                                        </button>
                                        <button class="btn btn-outline-primary view-profile" data-user-id="${user.userId}">
                                            <i class="bi bi-eye"></i> Профиль
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="no-likes">
                        <h3>Пока вас никто не отметил ✨</h3>
                        <p>Не переживайте! Заполните профиль и общайтесь с другими игроками - лайки не заставят себя ждать.</p>
                    </div>
                `}
            </section>

            <section class="likes-section given-likes">
                <h2><i class="bi bi-heart"></i> Ваши отметки</h2>
                ${allLikes.length > 0 ? `
                    <div class="likes-grid">
                        ${allLikes.map(user => `
                            <div class="like-card" data-user-id="${user.userId}">
                                <img src="${user.avatar}" alt="${user.username}'s avatar" class="like-avatar">
                                <div class="like-info">
                                    <h3>${user.username}</h3>
                                    <p class="aBitGray">Возраст: ${user.age}</p>
                                    <p class="${user.status === 'online' ? 'status-online' : 'status-offline'} aBitGray">
                                        ${user.status === 'online' ? 'онлайн' : 'офлайн'}
                                    </p>
                                    <p class="like-date aBitGray">
                                        Лайк поставлен: ${new Date(user.timestamp).toLocaleDateString()}
                                    </p>
                                    <button class="btn btn-outline-primary view-profile" data-user-id="${user.userId}">
                                        <i class="bi bi-eye"></i> Посмотреть профиль
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="no-likes">
                        <h3>Вы пока никого не отметили 🎮</h3>
                        <p>Найдите интересных игроков и отметьте тех, с кем хотели бы поиграть!</p>
                    </div>
                `}
            </section>
        </div>
    `;

    // Добавляем обработчики событий для кнопок
    const viewProfileButtons = main.querySelectorAll('.view-profile');
    viewProfileButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.closest('.view-profile').dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                window.location.href = `./profile.html?user=${user.username}`;
            }
        });
    });

    const chatButtons = main.querySelectorAll('.chat-button');
    chatButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.closest('.chat-button').dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                // В реальном приложении здесь был бы переход в чат
                Toastify({
                    text: `Чат с ${user.username} будет доступен в следующем обновлении!`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    className: "info"
                }).showToast();
            }
        });
    });
    
    // Обработчики для кнопок лайка в разделе "Понравились мне"
    const likeButtons = main.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.closest('.like-button').dataset.userId;
            const user = users.find(u => u.id === userId);
            
            if (user) {
                // Получаем текущие лайки пользователя
                const currentLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
                
                // Проверяем, не лайкнул ли уже этого пользователя
                const alreadyLiked = currentLikes.some(like => like.userId === user.id);
                
                if (!alreadyLiked) {
                    // Добавляем новый лайк
                    const newLike = {
                        userId: user.id,
                        timestamp: new Date().toISOString()
                    };
                    
                    currentLikes.push(newLike);
                    localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(currentLikes));
                    
                    // Проверяем, есть ли взаимный лайк
                    const otherUserLikes = JSON.parse(localStorage.getItem(`likes_${user.username}`) || '[]');
                    const isMutual = otherUserLikes.some(l => l.userId === loggedInUser);
                    
                    if (isMutual) {
                        // Показываем уведомление о взаимном лайке
                        Toastify({
                            text: `У вас взаимная симпатия с ${user.username}!`,
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            className: "success"
                        }).showToast();
                        
                        // Обновляем страницу, чтобы показать пользователя в разделе "Совпадения"
                        setTimeout(() => {
                            renderLikes();
                        }, 1000);
                    } else {
                        // Показываем уведомление о лайке
                        Toastify({
                            text: `Вы поставили лайк пользователю ${user.username}`,
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            className: "success"
                        }).showToast();
                        
                        // Обновляем страницу
                        setTimeout(() => {
                            renderLikes();
                        }, 1000);
                    }
                } else {
                    // Показываем уведомление, что лайк уже поставлен
                    Toastify({
                        text: `Вы уже лайкнули пользователя ${user.username}`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "info"
                    }).showToast();
                }
            }
        });
    });
}

// Инициализация страницы при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    const main = document.getElementById('main');
    if (!main) return;

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        main.innerHTML = `
            <div class="unauthorized-container">
                <h2>Для просмотра лайков необходимо войти</h2>
                <a href="./login/emailLogin.html" class="btn btn-primary">Войти</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch("./database.json");
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const db = await response.json();

        // Получаем лайки текущего пользователя
        const userLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
        const userDislikes = JSON.parse(localStorage.getItem(`dislikes_${loggedInUser}`) || '[]');

        // Получаем лайки других пользователей к текущему пользователю
        const likedByUsers = db.users.filter(user => {
            const theirLikes = JSON.parse(localStorage.getItem(`likes_${user.username}`) || '[]');
            return theirLikes.some(like => like.userId === loggedInUser);
        });

        // Находим взаимные лайки
        const mutualLikes = likedByUsers.filter(user => 
            userLikes.some(like => like.userId === user.id)
        );

        // Формируем HTML для разных секций
        let html = '<div class="likes-container">';

        // Секция взаимных лайков
        html += `
            <div class="likes-section">
                <h2>Взаимные симпатии</h2>
                <div class="likes-grid">
                    ${mutualLikes.length ? mutualLikes.map(user => `
                        <div class="like-card mutual">
                            <img src="${user.avatar}" alt="${user.username}" class="like-avatar">
                            <div class="like-info">
                                <h3>${user.username}</h3>
                                <p class="like-date">Взаимная симпатия</p>
                            </div>
                            <div class="like-actions">
                                <button class="dislike-button" data-user-id="${user.id}">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                                            `).join('') : '<p class="no-likes">Нету взаимных лайокв</p>'}
                </div>
            </div>
        `;

        // Секция пользователей, которые лайкнули текущего пользователя
        const likedByNotMutual = likedByUsers.filter(user => 
            !mutualLikes.some(mutual => mutual.id === user.id)
        );

        html += `
            <div class="likes-section">
                <h2>Вас лайкнули</h2>
                <div class="likes-grid">
                    ${likedByNotMutual.length ? likedByNotMutual.map(user => `
                        <div class="like-card liked-by">
                            <img src="${user.avatar}" alt="${user.username}" class="like-avatar">
                            <div class="like-info">
                                <h3>${user.username}</h3>
                                <p class="like-date">Лайкнул(а) вас</p>
                            </div>
                            <div class="like-actions">
                                <button class="like-button" data-user-id="${user.id}">
                                    <i class="bi bi-heart"></i>
                                </button>
                                <button class="dislike-button" data-user-id="${user.id}">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : '<p class="no-likes">Пока никто не поставил вам лайк</p>'}
                </div>
            </div>
        `;

        // Секция пользователей, которых лайкнул текущий пользователь
        const likedByMe = db.users.filter(user => 
            userLikes.some(like => like.userId === user.id) &&
            !mutualLikes.some(mutual => mutual.id === user.id)
        );

        html += `
            <div class="likes-section">
                <h2>Вы лайкнули</h2>
                <div class="likes-grid">
                    ${likedByMe.length ? likedByMe.map(user => `
                        <div class="like-card">
                            <img src="${user.avatar}" alt="${user.username}" class="like-avatar">
                            <div class="like-info">
                                <h3>${user.username}</h3>
                                <p class="like-date">Вы лайкнули</p>
                            </div>
                            <div class="like-actions">
                                <button class="dislike-button" data-user-id="${user.id}">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : '<p class="no-likes">Вы пока никого не лайкнули</p>'}
                </div>
            </div>
        `;

        html += '</div>';
        main.innerHTML = html;

        // Добавляем обработчики для кнопок
        document.querySelectorAll('.like-button, .dislike-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.userId;
                const isLike = e.currentTarget.classList.contains('like-button');
                const user = db.users.find(u => u.id === userId);

                if (!user) return;

                if (isLike) {
                    const newLike = {
                        userId: user.id,
                        timestamp: new Date().toISOString()
                    };
                    const currentLikes = JSON.parse(localStorage.getItem(`likes_${loggedInUser}`) || '[]');
                    currentLikes.push(newLike);
                    localStorage.setItem(`likes_${loggedInUser}`, JSON.stringify(currentLikes));

                    // Проверяем взаимный лайк
                    const theirLikes = JSON.parse(localStorage.getItem(`likes_${user.username}`) || '[]');
                    const isMutual = theirLikes.some(like => like.userId === loggedInUser);

                    Toastify({
                        text: isMutual ? `У вас взаимная симпатия с ${user.username}!` : `Вы поставили лайк пользователю ${user.username}`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: isMutual ? "success" : "info"
                    }).showToast();
                } else {
                    // Дизлайк
                    const currentDislikes = JSON.parse(localStorage.getItem(`dislikes_${loggedInUser}`) || '[]');
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

                    Toastify({
                        text: `Вы больше не будете видеть пользователя ${user.username}`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        className: "info"
                    }).showToast();
                }

                // Перезагружаем страницу для обновления списка
                setTimeout(() => location.reload(), 500);
            });
        });

    } catch (error) {
        console.error('Ошибка:', error);
        main.innerHTML = '<p class="error-message">Не удалось загрузить данные. Попробуйте позже.</p>';
    }
}); 