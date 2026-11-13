document.addEventListener('DOMContentLoaded', () => {
  // фоны
  const backgroundImages = [
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg'
  ];

  let lastBgIndex = -1;
  const bgLayer = document.getElementById('bg-layer');

  function changeBackground() {
    if (!bgLayer || backgroundImages.length === 0) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * backgroundImages.length);
    } while (randomIndex === lastBgIndex && backgroundImages.length > 1);

    lastBgIndex = randomIndex;
    bgLayer.style.backgroundImage = `url('backgrounds/${backgroundImages[randomIndex]}')`;
  }

  changeBackground();

  // 2. ЗАГРУЗКА ДАННЫХ И ОТОБРАЖЕНИЕ ТАБЛИЦЫ
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
        tbody.innerHTML =
          '<tr><td colspan="3" style="text-align: center; color: #ff6b6b;">Не удалось загрузить projects_info.json</td></tr>';
      }
    });

  function updateCounts() {
  const categories = ['done', 'wip', 'future', 'frozen', 'cancelled'];
  categories.forEach(cat => {
    const count = projectsData[cat] ? Object.keys(projectsData[cat]).length : 0;
    document.getElementById(`count-${cat}`).textContent = count;
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

    fetch(`settings.json?t=${Date.now()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(settings => {
      const footerInfo = document.getElementById('footer-info');
      if (!footerInfo) return;

      // 3. Discord (при нажатии меняет текст на значение из JSON)
      if (settings.ds && settings.ds.trim() !== '') {
        const dsValue = settings.ds.trim();
        const dsBtn = document.createElement('button');
        dsBtn.type = 'button';
        dsBtn.className = 'social-btn';
        dsBtn.textContent = 'Discord';

        dsBtn.addEventListener('click', () => {
          dsBtn.textContent = 'Discord: ' + dsValue;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(dsValue).catch(() => {});
          }
        });

        footerInfo.appendChild(dsBtn);
      }

      const otherLinks = [
        { key: 'tg_server', label: 'Канал' },
        { key: 'yt_channel', label: 'YouTube' },
        { key: 'tg', label: 'Telegram' }
      ];

      otherLinks.forEach(item => {
        const url = settings[item.key];
        if (url && url.trim() !== '') {
          const link = document.createElement('a');
          link.href = url.trim();
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'social-btn';
          link.textContent = item.label;
          footerInfo.appendChild(link);
        }
      });
    })
    .catch(error => {
      console.error('Ошибка загрузки settings.json:', error);
    });

});
