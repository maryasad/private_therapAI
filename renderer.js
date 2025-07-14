// Initialize mood chart
let moodChart;
const sentimentHistory = [];

// Tab switching functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
            
            // If switching to journal tab and chart isn't initialized, initialize it
            if (tabId === 'journal-tab' && !moodChart) {
                initializeChart();
            }
        });
    });
}

// Initialize the mood chart
function initializeChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Mood Trend',
                data: [],
                borderColor: '#5e72e4',
                backgroundColor: 'rgba(94, 114, 228, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Sentiment Score'
                    },
                    ticks: {
                        stepSize: 0.5
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `Score: ${context.parsed.y.toFixed(2)}`
                    }
                }
            }
        }
    });
}

// Update the mood chart with new data
function updateChart(sentimentScore) {
    if (!moodChart) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    sentimentHistory.push({
        x: timeString,
        y: sentimentScore
    });

    // Keep only the last 10 data points
    while (sentimentHistory.length > 10) {
        sentimentHistory.shift();
    }

    // Update chart data
    moodChart.data.labels = sentimentHistory.map(entry => entry.x);
    moodChart.data.datasets[0].data = sentimentHistory.map(entry => entry.y);
    moodChart.update();
}

// Sentiment Analysis
async function analyzeText() {
    const text = document.getElementById("journal").value.trim();
    if (!text) {
        document.getElementById("sentiment").textContent = "Please enter some text to analyze.";
        return;
    }

    try {
        const response = await fetch("http://localhost:5001/sentiment", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const sentimentScore = parseFloat(data.polarity);
        
        // Update the sentiment display
        updateSentimentDisplay(sentimentScore);
        
        // Update the chart
        updateChart(sentimentScore);
        
        // Save the journal entry
        saveJournalEntry(text, sentimentScore);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("sentiment").textContent = 
            "Error analyzing sentiment. Please make sure the backend server is running.";
    }
}

function updateSentimentDisplay(score) {
    let sentimentText, sentimentClass;
    
    if (score > 0.3) {
        sentimentText = "😊 Positive";
        sentimentClass = "positive";
    } else if (score < -0.3) {
        sentimentText = "😔 Negative";
        sentimentClass = "negative";
    } else {
        sentimentText = "😐 Neutral";
        sentimentClass = "neutral";
    }
    
    const sentimentElement = document.getElementById("sentiment");
    sentimentElement.textContent = `Sentiment: ${sentimentText} (${score.toFixed(2)})`;
    sentimentElement.className = sentimentClass;
}

// Journal Entry Management
function saveJournalEntry(text, score) {
    // In a real app, you would save this to a database
    console.log('Saving journal entry:', { text, score, timestamp: new Date().toISOString() });
    // For demo purposes, we'll just update the UI
    const entryElement = document.createElement('div');
    entryElement.className = 'journal-entry';
    entryElement.innerHTML = `
        <p><strong>${new Date().toLocaleString()}</strong> (Score: ${score.toFixed(2)})</p>
        <p>${text}</p>
        <hr>
    `;
    
    const entriesContainer = document.getElementById('journal-entries');
    if (entriesContainer) {
        entriesContainer.prepend(entryElement);
    }
}

// Guided Journaling Functions
function usePrompt(promptText) {
    document.getElementById('journal-therapy').value = promptText + '\n\n';
    document.getElementById('prompts-container').classList.add('hidden');
    document.getElementById('custom-prompt-container').classList.remove('hidden');
    document.getElementById('journal-therapy').focus();
}

function backToPrompts() {
    document.getElementById('journal-therapy').value = '';
    document.getElementById('prompts-container').classList.remove('hidden');
    document.getElementById('custom-prompt-container').classList.add('hidden');
}

function saveTherapyEntry() {
    const text = document.getElementById('journal-therapy').value.trim();
    if (!text) {
        alert('Please write something before saving.');
        return;
    }
    
    // Here you would typically save to a database
    console.log('Saving therapy entry:', text);
    alert('Entry saved successfully!');
    backToPrompts();
    
    // Also analyze the sentiment of the therapy entry
    analyzeTherapyText(text);
}

async function analyzeTherapyText(text) {
    try {
        const response = await fetch("http://localhost:5001/sentiment", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const sentimentScore = parseFloat(data.polarity);
        
        // Update the chart with the therapy entry's sentiment
        updateChart(sentimentScore);
        
    } catch (error) {
        console.error('Error analyzing therapy text:', error);
    }
}

// Breathing Exercise
let breathingInterval;
let remainingTime = 120; // 2 minutes in seconds

function startBreathingExercise() {
    const startBtn = document.getElementById('start-breathing');
    const stopBtn = document.getElementById('stop-breathing');
    const circle = document.getElementById('breathing-circle');
    const instruction = document.getElementById('breathing-instruction');
    const timerDisplay = document.getElementById('breathing-timer');
    
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    timerDisplay.classList.remove('hidden');
    
    let phase = 'inhale';
    let timer = 0;
    
    // Reset timer
    remainingTime = 120;
    updateTimerDisplay();
    
    // Start the breathing animation
    breathingInterval = setInterval(() => {
        timer++;
        
        // 4-7-8 breathing pattern (in seconds)
        if (phase === 'inhale' && timer <= 4) {
            // Inhale for 4 seconds
            const scale = 1 + (timer / 4) * 0.5;
            circle.style.transform = `scale(${scale})`;
            circle.textContent = 'Breathe In';
            instruction.textContent = 'Inhale deeply through your nose...';
            
            if (timer === 4) {
                phase = 'hold1';
                timer = 0;
            }
        } 
        else if (phase === 'hold1' && timer <= 7) {
            // Hold for 7 seconds
            circle.textContent = 'Hold';
            instruction.textContent = 'Hold your breath...';
            
            if (timer === 7) {
                phase = 'exhale';
                timer = 0;
            }
        }
        else if (phase === 'exhale' && timer <= 8) {
            // Exhale for 8 seconds
            const scale = 1.5 - (timer / 8) * 0.5;
            circle.style.transform = `scale(${scale})`;
            circle.textContent = 'Breathe Out';
            instruction.textContent = 'Exhale slowly through your mouth...';
            
            if (timer === 8) {
                phase = 'inhale';
                timer = 0;
            }
        }
        
        // Update timer
        if (remainingTime > 0) {
            remainingTime--;
            updateTimerDisplay();
        } else {
            stopBreathingExercise();
        }
        
    }, 1000);
}

function stopBreathingExercise() {
    clearInterval(breathingInterval);
    
    const circle = document.getElementById('breathing-circle');
    const startBtn = document.getElementById('start-breathing');
    const stopBtn = document.getElementById('stop-breathing');
    const instruction = document.getElementById('breathing-instruction');
    
    circle.style.transform = 'scale(1)';
    circle.textContent = 'Breathe In';
    instruction.textContent = 'Click Start to begin the breathing exercise';
    
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    
    // Reset timer
    remainingTime = 120;
    updateTimerDisplay();
    document.getElementById('breathing-timer').classList.add('hidden');
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('time-remaining').textContent = 
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tabs
    setupTabs();
    
    // Initialize chart if on journal tab
    if (document.getElementById('journal-tab').classList.contains('active')) {
        initializeChart();
    }
    
    // Set up event listeners
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeText);
    }
    
    // Enter key support for journal textarea
    const journal = document.getElementById('journal');
    if (journal) {
        journal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                analyzeText();
            }
        });
    }
    
    // Breathing exercise controls
    const startBtn = document.getElementById('start-breathing');
    const stopBtn = document.getElementById('stop-breathing');
    
    if (startBtn && stopBtn) {
        startBtn.addEventListener('click', startBreathingExercise);
        stopBtn.addEventListener('click', stopBreathingExercise);
    }
    
    // Initialize any other components
    console.log('MindMate app initialized');
});
