// --- ВАША КОНФІГУРАЦІЯ FIREBASE ---
// Цей об'єкт дозволяє сайту підключитися до вашого проєкту cafe-menu-6b5e8
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
// КОД, ЯКИЙ КЕРУЄ ЗАВАНТАЖЕННЯМ МЕНЮ
// ----------------------------------------------------

// Ініціалізуємо Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Встановлюємо рівень логування для налагодження
firebase.firestore.setLogLevel('Debug');

// Знаходимо контейнер, куди будемо вставляти меню
const menuContainer = document.getElementById('menu-container');

async function fetchAndDisplayMenu() {
    try {
        // Отримуємо всі документи (страви) з колекції 'dishes'
        const snapshot = await db.collection('dishes').get();

        if (snapshot.empty) {
            menuContainer.innerHTML = '<h2 class="loader">Наразі в меню немає страв. Будь ласка, додайте їх у консолі Firebase.</h2>';
            return;
        }

        let dishes = [];
        snapshot.forEach(doc => {
            // Зберігаємо дані страви у масив
            dishes.push(doc.data());
        });

        // Групуємо страви за категоріями для гарного відображення
        const menuByCategory = dishes.reduce((acc, dish) => {
            // Якщо категорія не вказана у Firebase, використовуємо "Різне"
            const category = dish.category || 'Різне'; 
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(dish);
            return acc;
        }, {});

        // Очищуємо контейнер від напису "Завантажуємо..."
        menuContainer.innerHTML = '';

        // Сортуємо категорії за алфавітом для логічного порядку
        const sortedCategories = Object.keys(menuByCategory).sort();

        // Відображаємо категорії та страви
        for (const category of sortedCategories) {
            // Заголовок категорії
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'menu-category';
            categoryTitle.textContent = category;
            menuContainer.appendChild(categoryTitle);

            // Страви
            menuByCategory[category].forEach(dish => {
                const menuItem = document.createElement('article');
                menuItem.className = 'menu-item';

                // Перевіряємо, чи є ціна, і форматуємо її
                const priceText = (typeof dish.price === 'number' && dish.price !== 0) 
                                  ? `${dish.price} грн` 
                                  : 'Ціна за запитом';

                menuItem.innerHTML = `
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
        // Якщо сталася помилка підключення (наприклад, неправильні правила безпеки)
        console.error("Помилка при завантаженні меню. Перевірте Firebase Config та Правила Безпеки:", error);
        menuContainer.innerHTML = '<h2 class="loader">Помилка завантаження. Перевірте підключення до бази даних.</h2>';
    }
}

// Запускаємо завантаження меню при старті
fetchAndDisplayMenu();