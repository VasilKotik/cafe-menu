// --- ЕТАП 1: КОНФІГУРАЦІЯ FIREBASE ---
// ВАЖЛИВО: Замініть цей блок на ВАШУ КОНФІГУРАЦІЮ, 
// скопійовану з Налаштувань проєкту Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyDWMzypjRpuaaz099ZunDQojVEUuWSaUz0",
  authDomain: "cafe-menu-6b5e8.firebaseapp.com",
  projectId: "cafe-menu-6b5e8",
  storageBucket: "cafe-menu-6b5e8.firebasestorage.app",
  messagingSenderId: "422369212663",
  appId: "1:422369212663:web:15204697a6ef9a6191fbf2",
  measurementId: "G-JSX6ZR2VYQ"
};

// ----------------------------------------------------
// --- ЕТАП 2: ІНІЦІАЛІЗАЦІЯ (ЗАПУСК) ---
// ----------------------------------------------------

// Ініціалізуємо додаток Firebase з нашою конфігурацією
firebase.initializeApp(firebaseConfig);

// Отримуємо посилання на Firestore (база даних)
const db = firebase.firestore();

// Вмикаємо детальні лог-повідомлення в консолі для діагностики
firebase.firestore.setLogLevel('Debug');

// Знаходимо елемент-контейнер, куди будемо вставляти меню
const menuContainer = document.getElementById('menu-container');

// ----------------------------------------------------
// --- ЕТАП 3: ГОЛОВНА ФУНКЦІЯ ЗАВАНТАЖЕННЯ ---
// ----------------------------------------------------

// Асинхронна функція для отримання та відображення даних
async function fetchAndDisplayMenu() {
    
    try {
        // 1. ЗАПИТ ДО БАЗИ ДАНИХ FIREBASE
        // Отримуємо всі документи з колекції 'dishes'
        const snapshot = await db.collection('dishes').get();

        // 2. ПЕРЕВІРКА НА ПОРОЖНЄ МЕНЮ
        if (snapshot.empty) {
            menuContainer.innerHTML = '<h2 class="loader">Наразі в меню немає страв.</h2>';
            return;
        }

        // 3. ЗБІР ДАНИХ
        let dishes = [];
        // Перебираємо отримані документи та додаємо їх до масиву
        snapshot.forEach(doc => {
            dishes.push(doc.data());
        });

        // 4. ГРУПУВАННЯ ЗА КАТЕГОРІЯМИ
        // Створюємо об'єкт для зберігання страв, згрупованих за полем 'category'
        const menuByCategory = dishes.reduce((acc, dish) => {
            const category = dish.category || 'Різне';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(dish);
            return acc;
        }, {});

        // 5. ОЧИЩЕННЯ СТОРІНКИ (видаляємо "Завантажуємо меню...")
        menuContainer.innerHTML = '';

        // 6. СОРТУВАННЯ ТА ВІДОБРАЖЕННЯ КАТЕГОРІЙ
        const sortedCategories = Object.keys(menuByCategory).sort();

        for (const category of sortedCategories) {
            // Створюємо заголовок категорії (<h2>)
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'menu-category';
            categoryTitle.textContent = category;
            menuContainer.appendChild(categoryTitle);

            // 7. ВІДОБРАЖЕННЯ СТРАВ У КОЖНІЙ КАТЕГОРІЇ
            menuByCategory[category].forEach(dish => {
                
                const menuItem = document.createElement('article');
                menuItem.className = 'menu-item';

                // Форматуємо ціну
                const priceText = (typeof dish.price === 'number' && dish.price !== 0) 
                                  ? `${dish.price} грн` 
                                  : 'Ціна за запитом';
                
                // 8. ЛОГІКА ВІДОБРАЖЕННЯ ФОТОГРАФІЇ
                let imageHtml = ''; 
                
                // Перевіряємо, чи існує поле imageUrl і чи це справжнє посилання
                if (dish.imageUrl && typeof dish.imageUrl === 'string' && dish.imageUrl.startsWith('http')) {
                    // Якщо посилання є, створюємо тег <img>
                    imageHtml = `<img src="${dish.imageUrl}" alt="${dish.name || 'Фото страви'}" class="item-image">`;
                }

                // 9. ЗБИРАЄМО КАРТКУ СТРАВИ
                menuItem.innerHTML = `
                    ${imageHtml}
                    <div class="item-content">
                        <div class="item-header">
                            <h3>${dish.name || 'Назва відсутня'}</h3>
                            <span class="item-price">${priceText}</span>
                        </div>
                        <p class="item-description">${dish.description || 'Опис незабаром.'}</p>
                    </div>
                `;
                
                menuContainer.appendChild(menuItem);
            });
        }

    } catch (error) {
        // 10. ОБРОБКА ПОМИЛОК
        // Цей код спрацює, якщо не вдалося підключитися (наприклад, неправильний ключ API)
        console.error("Помилка при завантаженні меню:", error);
        menuContainer.innerHTML = '<h2 class="loader">Не вдалося завантажити меню. Перевірте підключення до бази даних.</h2>';
    }
}

// ----------------------------------------------------
// --- ЕТАП 4: ЗАПУСК ГОЛОВНОЇ ФУНКЦІЇ ---
// ----------------------------------------------------
fetchAndDisplayMenu();
// ----------------------------------------------------
// --- ЕТАП 4: ЗАПУСК ГОЛОВНОЇ ФУНКЦІЇ ---
// ----------------------------------------------------
fetchAndDisplayMenu();
