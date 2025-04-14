let currentWeekOffset = 0;

// Hilfsfunktionen
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function formatDate(date) {
  const yr = date.getFullYear();
  const mo = (date.getMonth() + 1).toString().padStart(2, '0');
  const da = date.getDate().toString().padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

function getWeekdayName(date) {
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  return days[date.getDay()];
}

// Wochenansicht erstellen
function buildWeekView() {
  const container = document.getElementById('weekContainer');
  container.innerHTML = "";

  const today = new Date();
  const baseMonday = getMonday(today);
  const weekMonday = new Date(baseMonday);
  weekMonday.setDate(baseMonday.getDate() + currentWeekOffset * 7);

  const weekLabel = document.getElementById('weekLabel');
  const weekEnd = new Date(weekMonday);
  weekEnd.setDate(weekMonday.getDate() + 6);
  weekLabel.textContent = `Woche: ${formatDate(weekMonday)} – ${formatDate(weekEnd)}`;

  const weekDiv = document.createElement('div');
  weekDiv.classList.add('week');

  const weekDaysDiv = document.createElement('div');
  weekDaysDiv.classList.add('week-days');

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekMonday);
    currentDay.setDate(weekMonday.getDate() + i);

    const dayCol = document.createElement('div');
    dayCol.classList.add('day-column');

    const isoDate = formatDate(currentDay);
    const weekday = getWeekdayName(currentDay);
    dayCol.setAttribute('data-date', isoDate);
    dayCol.setAttribute('data-day', weekday);

    const h3 = document.createElement('h3');
    h3.textContent = weekday;
    dayCol.appendChild(h3);

    const dateLabel = document.createElement('div');
    dateLabel.classList.add('date-label');
    dateLabel.textContent = isoDate;
    dayCol.appendChild(dateLabel);

    const ul = document.createElement('ul');
    ul.classList.add('task-list');
    dayCol.appendChild(ul);

    weekDaysDiv.appendChild(dayCol);
  }

  weekDiv.appendChild(weekDaysDiv);
  container.appendChild(weekDiv);
}

// Aufgaben aus LocalStorage
function createTaskListItem(task) {
  const li = document.createElement('li');
  li.textContent = `${task.time} - ${task.title} (${task.type})`;
  if (task.note) {
    const notePara = document.createElement('p');
    notePara.textContent = task.note;
    notePara.style.fontSize = '0.85rem';
    notePara.style.color = '#666';
    li.appendChild(notePara);
  }
  li.addEventListener('click', () => {
    window.location.href = `detail.html?id=${task.id}`;
  });
  return li;
}

function renderTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  tasks.forEach(task => {
    // feste Termine
    if (task.fixedDate) {
      const selector = `.day-column[data-date="${task.fixedDate}"] .task-list`;
      const ul = document.querySelector(selector);
      if (ul) {
        const li = createTaskListItem(task);
        ul.appendChild(li);
      }
    }

    // wiederholende Aufgaben
    if (task.repeatingDays && task.repeatingDays.length > 0) {
      task.repeatingDays.forEach(day => {
        const selector = `.day-column[data-day="${day}"] .task-list`;
        const uls = document.querySelectorAll(selector);
        uls.forEach(ul => {
          const li = createTaskListItem(task);
          ul.appendChild(li);
        });
      });
    }
  });
}

// Vorlesungsplan laden aus gruppe_1.json
function loadLectureSchedule() {
  fetch("gruppe_1.json")
    .then(res => res.json())
    .then(lectures => {
      console.log("✅ Geladene Vorlesungen:", lectures);

      lectures.forEach(lecture => {
        const datePart = lecture.date.split(",")[1]?.trim(); // z. B. "14.04."
        if (!datePart) {
          console.warn("❌ Ungültiges Datumsformat:", lecture.date);
          return;
        }

        const [day, month] = datePart.split(".");
        if (!day || !month) {
          console.warn("❌ Datum nicht lesbar:", datePart);
          return;
        }

        const isoDate = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const selector = `.day-column[data-date="${isoDate}"] .task-list`;

        console.log(`🔍 Suche nach: ${selector}`);

        const ul = document.querySelector(selector);
        if (!ul) {
          console.warn(`⚠️ Kein Element gefunden für ${isoDate}`);
          return;
        }

        const li = document.createElement('li');
        li.classList.add('lecture-task');
        li.textContent = `${lecture.start}–${lecture.end} ${lecture.event}`;
        if (lecture.room && lecture.room.trim() !== "") {
          li.textContent += ` [${lecture.room}]`;
        }
        li.title = "Vorlesung aus Stundenplan";
        ul.appendChild(li);

        console.log(`✅ Vorlesung hinzugefügt: ${li.textContent}`);
      });
    })
    .catch(err => {
      console.error("❌ Fehler beim Laden des Vorlesungsplans:", err);
    });
}

// Dashboard rendern
function renderDashboard() {
  buildWeekView();
  renderTasks();
  loadLectureSchedule();
}

// Navigation
document.getElementById('prevWeek').addEventListener('click', () => {
  currentWeekOffset--;
  renderDashboard();
});
document.getElementById('nextWeek').addEventListener('click', () => {
  currentWeekOffset++;
  renderDashboard();
});

// Initialisierung
document.addEventListener('DOMContentLoaded', renderDashboard);
