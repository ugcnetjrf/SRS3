document.addEventListener('DOMContentLoaded', function () {
  const today = new Date().toISOString().split('T')[0];
  const taskDateInput = document.getElementById('taskDate');
  if (taskDateInput) taskDateInput.value = today;

  showRevisionTasks();
  showAllTasks(); // only executes on all-tasks.html
  prefillCustomRegimes();
});

// ====== HOME PAGE FUNCTIONALITIES ======

function toggleTaskInput() {
  const section = document.getElementById('taskInputSection');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function saveTask() {
  const input = document.getElementById('taskInput');
  const dateInput = document.getElementById('taskDate');
  const regime = document.getElementById('srtRegimeSelector').value;

  if (!input.value || !dateInput.value) return alert('Please fill in the task and date.');

  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
  const date = dateInput.value;
  const entry = {
    text: input.value,
    regime: regime,
    date: date,
    reviewed: []
  };

  if (!tasks[date]) tasks[date] = [];
  tasks[date].push(entry);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  input.value = '';
  dateInput.value = new Date().toISOString().split('T')[0];
  document.getElementById('taskInputSection').style.display = 'none';
  showRevisionTasks();
}

function showRevisionTasks() {
  const list = document.getElementById('revisionTasksList');
  if (!list) return;

  list.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
  const customRegimes = JSON.parse(localStorage.getItem('customRegimes') || '{}');

  Object.entries(tasks).forEach(([taskDate, taskList]) => {
    taskList.forEach((task, index) => {
      const intervals = getIntervalsForRegime(task.regime, customRegimes);
      const dueDates = intervals.map(d => getFutureDate(task.date, d));
      if (dueDates.includes(today)) {
        const li = document.createElement('li');
        li.textContent = task.text;
        li.className = task.reviewed.includes(today) ? 'done' : '';
        li.onclick = () => alert(`Task: ${task.text}\nDate: ${task.date}\nRegime: ${task.regime}`);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.reviewed.includes(today);
        checkbox.onchange = () => {
          if (checkbox.checked) {
            if (!task.reviewed.includes(today)) task.reviewed.push(today);
          } else {
            task.reviewed = task.reviewed.filter(d => d !== today);
          }
          localStorage.setItem('tasks', JSON.stringify(tasks));
          showRevisionTasks();
        };

        li.prepend(checkbox);
        list.appendChild(li);
      }
    });
  });
}

// ====== UTILITY FUNCTIONS ======

function getIntervalsForRegime(regime, customRegimes) {
  if (regime === 'aggressive') return parseCustom(customRegimes.aggressive);
  if (regime === 'relaxed') return parseCustom(customRegimes.relaxed);
  return [1, 3, 7, 14, 21]; // Standard default
}

function parseCustom(input) {
  if (!input) return [];
  return input.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
}

function getFutureDate(start, daysToAdd) {
  const date = new Date(start);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}

// ====== ALL TASKS PAGE FUNCTIONALITIES ======

function showAllTasks() {
  const container = document.getElementById('allTasksContainer');
  if (!container) return;

  container.innerHTML = '';
  const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
  const sortedDates = Object.keys(tasks).sort();

  sortedDates.forEach(date => {
    const heading = document.createElement('h3');
    heading.textContent = date;
    container.appendChild(heading);

    tasks[date].forEach((task, index) => {
      const div = document.createElement('div');
      div.className = 'task-block';

      const text = document.createElement('p');
      text.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => {
        tasks[date].splice(index, 1);
        if (tasks[date].length === 0) delete tasks[date];
        localStorage.setItem('tasks', JSON.stringify(tasks));
        showAllTasks();
      };

      const regimeInfo = document.createElement('small');
      regimeInfo.textContent = `Regime: ${task.regime}`;

      div.appendChild(text);
      div.appendChild(regimeInfo);
      div.appendChild(deleteBtn);
      container.appendChild(div);
    });
  });

  addRegimeInputs(container);
}

function downloadTasks() {
  const tasks = localStorage.getItem('tasks');
  const blob = new Blob([tasks], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'tasks_backup.txt';
  link.href = URL.createObjectURL(blob);
  link.click();
}

function uploadTasks(event) {
  const file = event.target.files[0];
  if (!file || !file.name.endsWith('.txt')) {
    alert('Please upload a .txt file');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const uploadedTasks = JSON.parse(e.target.result);
      if (typeof uploadedTasks !== 'object') throw new Error();

      localStorage.setItem('tasks', JSON.stringify(uploadedTasks));
      alert('Tasks uploaded successfully!');
      showAllTasks();
    } catch (err) {
      alert('Invalid file format');
    }
  };
  reader.readAsText(file);
}

function resetAllTasks() {
  if (confirm('Are you sure you want to delete all tasks?')) {
    localStorage.removeItem('tasks');
    showAllTasks();
  }
}

// ====== CUSTOM REGIME MANAGEMENT ======

function addRegimeInputs(container) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <h3>Define Custom SRT Regimes</h3>
    <label>Aggressive (comma-separated days): <input id="customAggressive" placeholder="e.g., 1,2,4,6,9"></label><br>
    <label>Relaxed (comma-separated days): <input id="customRelaxed" placeholder="e.g., 2,5,10,20"></label><br>
    <button onclick="saveRegime()">Save Regimes</button>
  `;

  container.appendChild(wrapper);
}

function saveRegime() {
  const aggressive = document.getElementById('customAggressive').value;
  const relaxed = document.getElementById('customRelaxed').value;

  const regimeData = {
    aggressive: aggressive,
    relaxed: relaxed
  };

  localStorage.setItem('customRegimes', JSON.stringify(regimeData));
  alert('Custom regimes saved!');
}

function prefillCustomRegimes() {
  const regimeData = JSON.parse(localStorage.getItem('customRegimes') || '{}');
  if (document.getElementById('customAggressive')) {
    document.getElementById('customAggressive').value = regimeData.aggressive || '';
    document.getElementById('customRelaxed').value = regimeData.relaxed || '';
  }
}
