// Local storage initialization
const taskData = JSON.parse(localStorage.getItem('tasks')) || {};
let srtRegime = localStorage.getItem('srt-regime') || 'standard';
let customIntervals = JSON.parse(localStorage.getItem('custom-intervals')) || {
    aggressive: [1, 3, 7, 14, 21],
    relaxed: [1, 3, 7, 14, 21]
};

// DOM Elements
const srtDropdown = document.getElementById('srt-regime');
const addTaskBtn = document.getElementById('add-task-btn');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskTitleInput = document.getElementById('task-title');
const taskDetailsInput = document.getElementById('task-details');
const taskDateInput = document.getElementById('task-date');
const viewAllTasksBtn = document.getElementById('view-all-tasks-btn');
const defineSRTModal = document.getElementById('define-srt-modal');
const overlay = document.getElementById('overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveIntervalsBtn = document.getElementById('save-intervals-btn');
const day1Input = document.getElementById('day-1');
const day3Input = document.getElementById('day-3');
const day7Input = document.getElementById('day-7');
const day14Input = document.getElementById('day-14');
const day21Input = document.getElementById('day-21');

// Event listeners
srtDropdown.addEventListener('change', (e) => {
    srtRegime = e.target.value;
    localStorage.setItem('srt-regime', srtRegime);
});

addTaskBtn.addEventListener('click', () => {
    document.getElementById('task-form-container').style.display = 'block';
    document.getElementById('task-form-container').scrollIntoView();
});

saveTaskBtn.addEventListener('click', () => {
    const taskTitle = taskTitleInput.value.trim();
    const taskDetails = taskDetailsInput.value.trim();
    const taskDate = taskDateInput.value;

    if (taskTitle && taskDetails && taskDate) {
        const taskId = new Date().toISOString();
        const task = {
            title: taskTitle,
            details: taskDetails,
            date: taskDate,
            srtRegime,
            revisionSchedule: getRevisionSchedule(taskDate)
        };

        // Save task
        taskData[taskId] = task;
        localStorage.setItem('tasks', JSON.stringify(taskData));

        // Reset form
        taskTitleInput.value = '';
        taskDetailsInput.value = '';
        taskDateInput.value = '';

        alert('Task added successfully!');
    } else {
        alert('Please fill in all fields!');
    }
});

viewAllTasksBtn.addEventListener('click', () => {
    window.location.href = 'all-tasks.html';
});

closeModalBtn.addEventListener('click', () => {
    defineSRTModal.style.display = 'none';
    overlay.style.display = 'none';
});

saveIntervalsBtn.addEventListener('click', () => {
    const newIntervals = [
        parseInt(day1Input.value) || 1,
        parseInt(day3Input.value) || 3,
        parseInt(day7Input.value) || 7,
        parseInt(day14Input.value) || 14,
        parseInt(day21Input.value) || 21
    ];

    customIntervals[srtRegime] = newIntervals;
    localStorage.setItem('custom-intervals', JSON.stringify(customIntervals));

    alert('Custom intervals saved successfully!');
    defineSRTModal.style.display = 'none';
    overlay.style.display = 'none';
});

// Function to calculate revision schedule
function getRevisionSchedule(taskDate) {
    const intervals = customIntervals[srtRegime];
    const schedule = intervals.map((interval) => {
        const date = new Date(taskDate);
        date.setDate(date.getDate() + interval);
        return date.toISOString().split('T')[0];
    });
    return schedule;
}

// Set default values for the interval modal
function setModalDefaults() {
    if (srtRegime === 'aggressive' || srtRegime === 'relaxed') {
        const intervals = customIntervals[srtRegime];
        day1Input.value = intervals[0];
        day3Input.value = intervals[1];
        day7Input.value = intervals[2];
        day14Input.value = intervals[3];
        day21Input.value = intervals[4];
    }
}

setModalDefaults();
