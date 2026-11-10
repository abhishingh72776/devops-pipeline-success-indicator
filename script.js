const runButton = document.getElementById("runPipeline");

const mainStatus = document.getElementById("mainStatus");
const statusDescription = document.getElementById("statusDescription");

const totalBuilds = document.getElementById("totalBuilds");
const successfulBuilds = document.getElementById("successfulBuilds");
const failedBuilds = document.getElementById("failedBuilds");
const successRate = document.getElementById("successRate");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const historyTable = document.getElementById("historyTable");
const logContainer = document.getElementById("logContainer");

const stages = ["source", "build", "test", "deploy"];

let buildCount = 0;
let successCount = 0;
let failureCount = 0;
let isRunning = false;


// Add an activity log entry safely to the page.
function addLog(message, type = "") {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;

    const timeElement = document.createElement("span");
    timeElement.className = "log-time";
    timeElement.textContent = new Date().toLocaleTimeString();

    const messageElement = document.createElement("span");
    messageElement.textContent = message;

    entry.append(timeElement, messageElement);
    logContainer.prepend(entry);
}


// Update the progress bar.
function updateProgress(value) {
    progressFill.style.width = `${value}%`;
    progressText.textContent = `${value}%`;
}


// Recalculate the dashboard statistics.
function updateStats() {
    totalBuilds.textContent = buildCount;
    successfulBuilds.textContent = successCount;
    failedBuilds.textContent = failureCount;

    const rate = buildCount === 0
        ? 0
        : Math.round((successCount / buildCount) * 100);

    successRate.textContent = `${rate}%`;
}


// Reset all stages before a new run.
function resetStages() {
    stages.forEach(name => {
        const stage = document.getElementById(`stage-${name}`);
        stage.className = "stage";
        stage.querySelector(".stage-status").textContent = "Waiting";
    });

    updateProgress(0);
}


// Set a stage to running, success, or failed.
function updateStage(name, status) {
    const stage = document.getElementById(`stage-${name}`);
    const statusText = stage.querySelector(".stage-status");

    stage.className = `stage ${status}`;

    if (status === "running") statusText.textContent = "Running...";
    if (status === "success") statusText.textContent = "Completed";
    if (status === "failed") statusText.textContent = "Failed";
}


// Pause between frontend prototype stages.
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


// Add one execution to the history table.
function addHistory(status) {
    const emptyRow = historyTable.querySelector(".empty-state");
    if (emptyRow) historyTable.innerHTML = "";

    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = `#BUILD-${String(buildCount).padStart(3, "0")}`;

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `status-pill ${status}`;
    badge.textContent = status === "success" ? "SUCCESS" : "FAILED";
    statusCell.appendChild(badge);

    const timeCell = document.createElement("td");
    timeCell.textContent = new Date().toLocaleTimeString();

    row.append(idCell, statusCell, timeCell);
    historyTable.prepend(row);
}


// Frontend-only prototype: this does not start a real CI/CD workflow.
async function runPipeline() {
    if (isRunning) return;

    isRunning = true;
    buildCount++;

    runButton.disabled = true;
    runButton.textContent = "Running...";

    resetStages();

    mainStatus.textContent = "Pipeline Running";
    statusDescription.textContent = "Frontend prototype is simulating the stages.";
    addLog(`Prototype run #${buildCount} started.`);

    const simulatedFailure = false;

    for (let i = 0; i < stages.length; i++) {
        const currentStage = stages[i];

        updateStage(currentStage, "running");
        addLog(`${currentStage.toUpperCase()} stage started.`);

        await delay(1200);

        if (simulatedFailure && currentStage === "test") {
            updateStage(currentStage, "failed");
            addLog(`${currentStage.toUpperCase()} stage failed.`, "error");
            break;
        }

        updateStage(currentStage, "success");
        addLog(`${currentStage.toUpperCase()} stage completed.`, "success");
        updateProgress(Math.round(((i + 1) / stages.length) * 100));
    }

    if (simulatedFailure) {
        failureCount++;
        mainStatus.textContent = "Pipeline Failed";
        statusDescription.textContent = "The simulated test stage failed.";
        addLog("Prototype execution failed.", "error");
        addHistory("failed");
    } else {
        successCount++;
        mainStatus.textContent = "Pipeline Successful";
        statusDescription.textContent = "All simulated stages completed. This is not a real deployment.";
        addLog("Prototype execution completed successfully.", "success");
        addHistory("success");
    }

    updateStats();

    isRunning = false;
    runButton.disabled = false;
    runButton.textContent = "▶ Run Pipeline";
}

runButton.addEventListener("click", runPipeline);
