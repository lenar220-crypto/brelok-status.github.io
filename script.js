document.addEventListener('DOMContentLoaded', () => {
    // Фоны
    const backgroundImages = [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg'
    ];
    let lastBgIndex = -1;
    const bgLayer = document.getElementById('bg-layer');

    function changeBackground(isFirstLoad = false) {
        if (!bgLayer || backgroundImages.length === 0) return;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * backgroundImages.length);
        } while (randomIndex === lastBgIndex && backgroundImages.length > 1);

        lastBgIndex = randomIndex;
        const nextImageUrl = `backgrounds/${backgroundImages[randomIndex]}`;

        // Предзагрузка картинки, чтобы не было рывков при появлении
        const img = new Image();
        img.src = nextImageUrl;

        img.onload = () => {
            if (isFirstLoad) {
                // При первой загрузке сразу ставим картинку и плавно проявляем
                bgLayer.style.backgroundImage = `url('${nextImageUrl}')`;
                bgLayer.style.opacity = '1';
                return;
            }

            // 1. Плавно делаем слой прозрачным (виден чёрный фон под ним)
            bgLayer.style.opacity = '0';

            // 2. Ждём 800 мс (время анимации в CSS), меняем картинку и проявляем обратно
            setTimeout(() => {
                bgLayer.style.backgroundImage = `url('${nextImageUrl}')`;
                bgLayer.style.opacity = '1';
            }, 800);
        };
    }

    // Первый запуск без ухода в чёрный
    changeBackground(true);
    setInterval(() => changeBackground(false), 15000);

    // --- Остальной ваш код без изменений ---
    let projectsData = {};
    let currentCategory = 'done';

    fetch(`projects_info.json?t=${Date.now()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            projectsData = data;
            updateCounts();
            renderTable(currentCategory);
        })
        .catch(error => {
            console.error('Ошибка загрузки JSON:', error);
            const tbody = document.getElementById('projects-body');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #ff6b6b;">Не удалось загрузить projects_info.json</td></tr>';
            }
        });

    function updateCounts() {
        const categories = ['done', 'wip', 'frozen', 'cancelled'];
        categories.forEach(cat => {
            const countEl = document.getElementById(`count-${cat}`);
            if (countEl) {
                const count = projectsData[cat] ? Object.keys(projectsData[cat]).length : 0;
                countEl.textContent = count;
            }
        });
    }

    function renderTable(category) {
        const tbody = document.getElementById('projects-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const categoryItems = projectsData[category];
        if (!categoryItems || Object.keys(categoryItems).length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #888;">В этой категории пока нет проектов</td></tr>';
            return;
        }

        for (const [projectName, details] of Object.entries(categoryItems)) {
            const tr = document.createElement('tr');
            const iconSrc = details.icon_name ? `icons/${details.icon_name}` : '';
            const iconHtml = iconSrc
                ? `<img src="${iconSrc}" alt="" class="project-icon" onerror="this.style.visibility='hidden'">`
                : `<div class="project-icon"></div>`;

            tr.innerHTML = `
                <td>
                    <div class="name-cell">
                        ${iconHtml}
                        <span>${projectName}</span>
                    </div>
                </td>
                <td>${details.info || '-'}</td>
                <td class="date-cell">${details.date || '-'}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderTable(currentCategory);
        });
    });
});
