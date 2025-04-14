// planner.js

// Globaler Offset in Wochen (0 = aktuelle Woche; -1 = Vorwoche; 1 = nächste Woche etc.)
let currentWeekOffset = 0;

// Hilfsfunktion: Ermittelt den Montag der Woche für ein gegebenes Datum
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Formatiert ein Datum im Format YYYY-MM-DD
function formatDate(date) {
  const yr = date.getFullYear();
  const mo = (date.getMonth() + 1).toString().padStart(2, '0');
  const da = date.getDate().toString().padStart(2, '0');
  return `${yr}-${mo}-${da}`;
}

// Gibt den deutschen Namen des Wochentags zurück
function getWeekdayName(date) {
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  return days[date.getDay()];
}

// Baut die Wochenansicht für die Woche, die um currentWeekOffset verschoben ist
function buildWeekView() {
  const container = document.getElementById('weekContainer');
  container.innerHTML = "";

  const today = new Date();
  const baseMonday = getMonday(today);
  // Verschiebe den Montag um currentWeekOffset*7 Tage
  const weekMonday = new Date(baseMonday);
  weekMonday.setDate(baseMonday.getDate() + currentWeekOffset * 7);

  // Aktualisiere die Überschrift
  const weekLabel = document.getElementById('weekLabel');
  const weekEnd = new Date(weekMonday);
  weekEnd.setDate(weekMonday.getDate() + 6);
  weekLabel.textContent = `Woche: ${formatDate(weekMonday)} - ${formatDate(weekEnd)}`;

  // Erstelle die 7 Tag-Spalten
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
    dayCol.setAttribute('data-date', isoDate);
    dayCol.setAttribute('data-day', getWeekdayName(currentDay));

    const h3 = document.createElement('h3');
    h3.textContent = getWeekdayName(currentDay);
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

// Rendert alle Aufgaben aus LocalStorage in die aktuell angezeigte Woche
function renderTasks() {
  // Alle Aufgaben laden
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    // Falls die Aufgabe ein festes Datum hat – nur in der Woche anzeigen, wenn das Datum vorhanden ist
    if (task.fixedDate) {
      // Suche die Spalte mit data-date gleich task.fixedDate
      const selector = `.day-column[data-date="${task.fixedDate}"] .task-list`;
      const ul = document.querySelector(selector);
      if (ul) {
        const li = createTaskListItem(task);
        ul.appendChild(li);
      }
    }
    // Für wiederkehrende Aufgaben: für jeden Wiederholungstag
    if (task.repeatingDays && task.repeatingDays.length > 0) {
      task.repeatingDays.forEach(day => {
        // Finde alle day-column-Elemente, deren data-day mit dem Tag übereinstimmt
        const selector = `.day-column[data-day="${day}"] .task-list`;
        const lists = document.querySelectorAll(selector);
        lists.forEach(ul => {
          const li = createTaskListItem(task);
          ul.appendChild(li);
        });
      });
    }
  });
}

// Hilfsfunktion, um ein Listenelement für eine Aufgabe zu erstellen.
// Die Listeneinträge sind anklickbar; bei Klick gelangst du zur Detailseite.
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
  // Klick-Event: Weiterleitung zur Detailseite mit der Task-ID als Query-Parameter
  li.addEventListener('click', function() {
    window.location.href = `detail.html?id=${task.id}`;
  });
  return li;
}

// Initiales Rendern der Woche und Aufgaben
function renderDashboard() {
  buildWeekView();
  renderTasks();
}

// Wochen-Navigation: Pfeile aktualisieren den globalen currentWeekOffset und rendern neu
document.getElementById('prevWeek').addEventListener('click', function() {
  currentWeekOffset--;
  renderDashboard();
});
document.getElementById('nextWeek').addEventListener('click', function() {
  currentWeekOffset++;
  renderDashboard();
});

document.addEventListener('DOMContentLoaded', renderDashboard);
