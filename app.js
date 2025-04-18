// Initialize tasks if not already in localStorage
if (!localStorage.getItem('tasks')) {
  localStorage.setItem('tasks', JSON.stringify([]));
}

if (!localStorage.getItem('aggressiveRegime')) {
  localStorage.setItem('aggressiveRegime', JSON.stringify([]));
}

if (!localStorage.getItem('relaxedRegime')) {
  localStorage.setItem('relaxedRegime', JSON.stringify([]));
}

document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('view-all-tasks-btn').addEventListener('click', viewAllTasks);
document.getElementById('reset-all-btn').addEventListener('click', resetAll);
document.getElementById('download-btn').addEventListener('click', downloadTasks);
document.getElementById('upload-btn').addEventListener('click', uploadTasks);
document.getElementById('update-sri-btn').addEventListener('click', updateSRI);

function addTask() {
  const title = document.getElementById('task-title').value;
  const detail = document.getElementById('task-detail').value;
  const regime = document.getElementById('srt-regime').value;

  if (!title || !detail) return alert("Please enter both title and detail");

  const task = {
    title,
    detail,
    regime,
    date: new Date().toLocaleDateString(),
    revision: [] // Initially no revision tasks
  };

  const tasks = JSON.parse(localStorage.getItem('tasks'));
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  alert("Task added successfully!");
  displayRevisionTasks();
}

function viewAllTasks() {
  window.location.href = "all-tasks.html";
}

function resetAll() {
  localStorage.removeItem('tasks');
  alert("All tasks reset!");
}

function downloadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const tasksText = JSON.stringify(tasks, null, 2);
  
  const blob = new Blob([tasksText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks_backup.txt';
  a.click();
}

function uploadTasks() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt';
  
  fileInput.onchange = function(event) {
    const file = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const tasks = JSON.parse(e.target.result);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        alert("Tasks uploaded successfully!");
        displayRevisionTasks();
      };
      reader.readAsText(file);
    }
  };
  
  fileInput.click();
}

function updateSRI() {
  window.location.href = "update-sri.html";
}

// Display revision tasks based on today's date
function displayRevisionTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const today = new Date().toLocaleDateString();
  
  const revisionTasks = tasks.filter(task => task.revision.includes(today));
  const revisionContainer = document.getElementById('revision-tasks');
  revisionContainer.innerHTML = ''; // Clear previous tasks
  
  revisionTasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.textContent = `${task.title}: ${task.detail}`;
    revisionContainer.appendChild(taskDiv);
  });
}

function addInterval(type) {
  const container = document.getElementById(type + '-intervals');
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.placeholder = 'Enter day interval';
  container.appendChild(input);
}

function saveRegimes() {
  const aggressiveIntervals = Array.from(document.getElementById('aggressive-intervals').querySelectorAll('input'))
                                    .map(input => parseInt(input.value))
                                    .filter(val => !isNaN(val));

  const relaxedIntervals = Array.from(document.getElementById('relaxed-intervals').querySelectorAll('input'))
                                 .map(input => parseInt(input.value))
                                 .filter(val => !isNaN(val));

  localStorage.setItem('aggressiveRegime', JSON.stringify(aggressiveIntervals));
  localStorage.setItem('relaxedRegime', JSON.stringify(relaxedIntervals));

  alert("Regimes updated successfully!");
}

document.addEventListener('DOMContentLoaded', displayRevisionTasks); // Call on page load
