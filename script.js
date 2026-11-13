// фоны
const backgroundImages = [
  '1.jpg',
  '2.jpg',
  '3.jpg',
  '3.jpg',
];

let lastBgIndex = -1;
const bgLayer = document.getElementById('bg-layer');

function changeBackground() {
  if (backgroundImages.length === 0) return;
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * backgroundImages.length);
  } while (randomIndex === lastBgIndex && backgroundImages.length > 1);

  lastBgIndex = randomIndex;
  bgLayer.style.backgroundImage = `url('backgrounds/${backgroundImages[randomIndex]}')`;
}

changeBackground();
setInterval(changeBackground, 15000);

let projectsData = {};
let currentCategory = 'done';

fetch(`projects_info.json?t=${Date.now()}`)
  .then(response => response.json())
  .then(data => {
    projectsData = data;
    updateCounts();
    renderTable(currentCategory);
  })
  .catch(error => {
    console.error('ошибка загрузки JSON:', error);
    document.getElementById('projects-body').innerHTML =
      '<tr><td colspan="3" style="text-align: center; color: #ff6b6b;">Can\'t get the data</td></tr>';
  });

function updateCounts() {
  const categories = ['done', 'wip', 'frozen', 'cancelled'];
  categories.forEach(cat => {
    const count = projectsData[cat] ? Object.keys(projectsData[cat]).length : 0;
    document.getElementById(`count-${cat}`).textContent = count;
  });
}

function renderTable(category) {
  const tbody = document.getElementById('projects-body');
  tbody.innerHTML = '';

  const categoryItems = projectsData[category];

  if (!categoryItems || Object.keys(categoryItems).length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #888;">There\'s nothing here yet</td></tr>';
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
