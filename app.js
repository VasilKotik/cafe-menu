// --- ЕТАП 1: КОНФІГУРАЦІЯ FIREBASE ---
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
// --- ЕТАП 2: ІНІЦІАЛІЗАЦІЯ ТА ЗМІННІ ---
// ----------------------------------------------------
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
firebase.firestore.setLogLevel('Debug');

const menuContainer = document.getElementById('menu-container');
// ДОДАНО: Отримуємо нові елементи
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// ДОДАНО: Глобальні змінні для зберігання даних
let allDishes = [];
let allCategories = new Set(); // Використовуємо Set, щоб уникнути дублікатів

// ----------------------------------------------------
// --- ЕТАП 3: ФУНКЦІЇ ВІДОБРАЖЕННЯ ---
// ----------------------------------------------------

/**
 * Ця функція відображає страви на сторінці.
 * Вона бере логіку з вашого оригінального файлу.
 */
function displayDishes(dishesToDisplay) {
    // 5. ОЧИЩЕННЯ СТОРІНКИ
    menuContainer.innerHTML = '';

    // Якщо нічого не знайдено
    if (dishesToDisplay.length === 0) {
        menuContainer.innerHTML = '<h2 class="loader">Нічого не знайдено за вашим запитом.</h2>';
        return;
    }

    // 4. ГРУПУВАННЯ ЗА КАТЕГОРІЯМИ
    const menuByCategory = dishesToDisplay.reduce((acc, dish) => {
        const category = dish.category || 'Різне';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(dish);
        return acc;
    }, {});

    // 6. СОРТУВАННЯ ТА ВІДОБРАЖЕННЯ КАТЕГОРІЙ
    const sortedCategories = Object.keys(menuByCategory).sort();

    for (const category of sortedCategories) {
        // Створюємо заголовок категорії (<h2>)
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'menu-category';
        categoryTitle.textContent = category;
        menuContainer.appendChild(categoryTitle);

        // 7. ВІДОБРАЖЕННЯ СТРАВ
        menuByCategory[category].forEach(dish => {
            const menuItem = document.createElement('article');
            menuItem.className = 'menu-item';

            const priceText = (typeof dish.price === 'number' && dish.price !== 0) 
                              ? `${dish.price} грн` 
                              : 'Ціна за запитом';
            
            let imageHtml = ''; 
            if (dish.imageUrl && typeof dish.imageUrl === 'string' && dish.imageUrl.startsWith('http')) {
                imageHtml = `<img src="${dish.imageUrl}" alt="${dish.name || 'Фото страви'}" class="item-image">`;
            }

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
}

/**
 * ДОДАНО: Ця функція заповнює випадаючий список категорій.
 */
function populateCategoryFilter() {
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

/**
 * ДОДАНО: Ця функція фільтрує та відображає страви.
 */
function filterAndDisplay() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    let filteredDishes = allDishes;

    // 1. Фільтруємо за категорією
    if (selectedCategory !== 'all') {
        filteredDishes = filteredDishes.filter(dish => (dish.category || 'Різне') === selectedCategory);
    }

    // 2. Фільтруємо за пошуковим терміном
    if (searchTerm.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
            const name = (dish.name || '').toLowerCase();
            const description = (dish.description || '').toLowerCase();
            return name.includes(searchTerm) || description.includes(searchTerm);
        });
    }

    // 3. Відображаємо результат
    displayDishes(filteredDishes);
}

// ----------------------------------------------------
// --- ЕТАП 4: ЗАВАНТАЖЕННЯ ДАНИХ ТА ЗАПУСК ---
// ----------------------------------------------------

/**
 * РЕОРГАНІЗОВАНО: Ця функція тепер завантажує дані ОДИН РАЗ.
 */
async function fetchAndStoreMenu() {
    try {
        const snapshot = await db.collection('dishes').get();

        if (snapshot.empty) {
            menuContainer.innerHTML = '<h2 class="loader">Наразі в меню немає страв.</h2>';
            return;
        }

        // Зберігаємо всі страви та категорії
        snapshot.forEach(doc => {
            const dish = doc.data();
            allDishes.push(dish);
            allCategories.add(dish.category || 'Різне');
        });

        // Заповнюємо фільтр категорій
        populateCategoryFilter();
        
        // Відображаємо повне меню при першому завантаженні
        displayDishes(allDishes);

    } catch (error) {
        console.error("Помилка при завантаженні меню:", error);
        menuContainer.innerHTML = '<h2 class="loader">Не вдалося завантажити меню.</h2>';
    }
}

// ЗАПУСК:
// 1. Завантажуємо меню
fetchAndStoreMenu();

// 2. ДОДАНО: Встановлюємо обробники подій для фільтрів
searchInput.addEventListener('input', filterAndDisplay);
categoryFilter.addEventListener('change', filterAndDisplay);
