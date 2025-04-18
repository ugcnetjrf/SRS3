// Initialize the task array from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Load custom intervals from localStorage
let aggressiveRegime = JSON.parse(localStorage.getItem("srtAggressive")) || [1, 3, 7, 14, 21];
let relaxedRegime = JSON.parse(localStorage.getItem("srtRelaxed")) || [1, 3, 7, 14, 21];
let standardRegime = [1, 3, 7, 14, 21];

// Function to add new task
function addTask() {
  const title = document.getElementById('taskTitle').value;
  const detail = document.getElementById('taskDetail').value;
  const date = document.getElementById('taskDate').value;
  const regime = document.getElementById('sriRegimeSelect').value;

  if (!title || !detail || !date) {
    alert("Please fill in all fields.");
    return;
  }

  const task = {
    title,
    detail,
    date,
    regime,
    revisionDates: calculateRevisionDates(date, regime)
  };

  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  alert('Task added successfully!');
  clearFields();
  displayTasks();
}

// Function to calculate revision dates based on regime
function calculateRevisionDates(startDate, regime) {
  const intervals = getRegimeIntervals(regime);
  const start = new Date(startDate);
  const revisionDates = intervals.map(interval => {
    const date = new Date(start);
    date.setDate(date.getDate() + interval);
    return date.toLocaleDateString(); // Format date to a readable string
  });

  return revisionDates;
}

// Function to get intervals based on selected regime
function getRegimeIntervals(regime) {
  if (regime === 'standard') return standardRegime;
  if (regime === 'aggressive') return aggressiveRegime;
  if (regime === 'relaxed') return relaxedRegime;
  return standardRegime; // Default to standard if no valid regime
}

// Display tasks on the home page
function displayTasks() {
  const revisionTasksList = document.getElementById('revisionTasks');
  revisionTasksList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `${task.title} (Due: ${task.revisionDates[0]})`;

    const checkmark = document.createElement('input');
    checkmark.type = 'checkbox';
    checkmark.addEventListener('change', function() {
      if (this.checked) {
        li.style.backgroundColor = 'green';
      } else {
        li.style.backgroundColor = 'red';
      }
    });

    li.appendChild(checkmark);
    revisionTasksList.appendChild(li);
  });
}

// Clear fields after adding a task
function clearFields() {
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDetail').value = '';
  document.getElementById('taskDate').value = '';
}

// Add event listener for page load to show tasks
window.onload = function () {
  displayTasks();
};

// Function to update the aggressive regime
function updateAggressiveRegime() {
  const inputs = document.getElementById('aggressiveInputs').querySelectorAll('input');
  aggressiveRegime = Array.from(inputs).map(input => parseInt(input.value)).filter(val => !isNaN(val));

  localStorage.setItem("srtAggressive", JSON.stringify(aggressiveRegime));
  alert("Aggressive regime updated successfully!");
}

// Function to update the relaxed regime
function updateRelaxedRegime() {
  const inputs = document.getElementById('relaxedInputs').querySelectorAll('input');
  relaxedRegime = Array.from(inputs).map(input => parseInt(input.value)).filter(val => !isNaN(val));

  localStorage.setItem("srtRelaxed", JSON.stringify(relaxedRegime));
  alert("Relaxed regime updated successfully!");
}

// Add intervals dynamically for aggressive and relaxed regimes
function addInterval(type) {
  const container = document.getElementById(type + "Inputs");
  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.placeholder = "Enter day";
  container.appendChild(input);
}

// Function to delete a task from localStorage
function deleteTask(taskTitle) {
  tasks = tasks.filter(task => task.title !== taskTitle);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  displayTasks();
}
