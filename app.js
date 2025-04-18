function initializeData() {
  if (!localStorage.getItem('tasks')) localStorage.setItem('tasks', JSON.stringify([]));
  if (!localStorage.getItem('sri')) {
    localStorage.setItem('sri', JSON.stringify({
      aggressive: 1,
      relaxed: 1,
      standard: [1, 3, 7, 14, 21]
    }));
  }
}

initializeData();

function calculateRevisionDates(startDate, regime) {
  const sri = JSON.parse(localStorage.getItem('sri'));
  let intervals = [];

  if (regime === 'Standard') {
    intervals = sri.standard;
  } else if (regime === 'Aggressive') {
    intervals = [1, 2, 4, 7, 10].map(x => x * sri.aggressive);
  } else if (regime === 'Relaxed') {
    intervals = [1, 5, 10, 20, 30].map(x => x * sri.relaxed);
  }

  const revisions = [];
  const base = new Date(startDate);

  intervals.forEach(days => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    revisions.push(d.toISOString().slice(0, 10));
  });

  return revisions;
}

function displayTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const container = document.getElementById('revision-tasks-container');
  if (!container) return;
  container.innerHTML = '';

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task';
    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.details}</p>
      <p><strong>Revision Dates:</strong> ${task.revisionDates.join(', ')}</p>
    `;
    container.appendChild(div);
  });
}

window.onload = function () {
  displayTasks();

  const addBtn = document.getElementById('add-task-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const title = document.getElementById('task-title').value;
      const details = document.getElementById('task-details').value;
      const date = document.getElementById('task-date').value;
      const regime = document.getElementById('srt-regime').value;

      if (!title || !details || !date || !regime) {
        alert('Fill all fields!');
        return;
      }

      const task = {
        title, details, date, srtRegime: regime,
        revisionDates: calculateRevisionDates(date, regime)
      };

      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      displayTasks();

      document.getElementById('task-title').value = '';
      document.getElementById('task-details').value = '';
      document.getElementById('task-date').value = '';
    };
  }

  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      let text = '';
      tasks.forEach(t => {
        text += `Title: ${t.title}\nDetails: ${t.details}\nDate: ${t.date}\nSRT Regime: ${t.srtRegime}\nRevision Dates: ${t.revisionDates.join(', ')}\n\n`;
      });
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tasks_backup.txt';
      a.click();
    };
  }

  const resetBtn = document.getElementById('reset-all-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Delete all tasks?')) {
        localStorage.setItem('tasks', JSON.stringify([]));
        displayTasks();
      }
    };
  }

  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';

      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = evt => {
          const content = evt.target.result;
          const tasks = parseTasksFromText(content);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          alert('Tasks uploaded!');
          displayTasks();
        };
        reader.readAsText(file);
      };
      input.click();
    };
  }

  const updateSriBtn = document.getElementById('update-sri-btn');
  if (updateSriBtn) {
    updateSriBtn.onclick = () => {
      window.location.href = 'update-sri.html';
    };
  }

  const saveSriBtn = document.getElementById('save-sri-btn');
  if (saveSriBtn) {
    saveSriBtn.onclick = () => {
      const aggressive = parseInt(document.getElementById('aggressive-interval').value);
      const relaxed = parseInt(document.getElementById('relaxed-interval').value);
      const sri = JSON.parse(localStorage.getItem('sri'));
      sri.aggressive = aggressive;
      sri.relaxed = relaxed;
      localStorage.setItem('sri', JSON.stringify(sri));
      alert('SRI intervals saved!');
    };
  }

  const viewBtn = document.getElementById('view-all-tasks-btn');
  if (viewBtn) {
    viewBtn.onclick = () => window.location.href = 'all-tasks.html';
  }
};

function parseTasksFromText(text) {
  const lines = text.trim().split('\n');
  const tasks = [];
  let task = {};

  lines.forEach(line => {
    if (line.startsWith('Title:')) {
      if (Object.keys(task).length) tasks.push(task);
      task = { title: line.slice(6).trim() };
    } else if (line.startsWith('Details:')) task.details = line.slice(8).trim();
    else if (line.startsWith('Date:')) task.date = line.slice(5).trim();
    else if (line.startsWith('SRT Regime:')) task.srtRegime = line.slice(11).trim();
    else if (line.startsWith('Revision Dates:')) {
      task.revisionDates = line.slice(16).split(',').map(d => d.trim());
    }
  });

  if (Object.keys(task).length) tasks.push(task);
  return tasks;
}
