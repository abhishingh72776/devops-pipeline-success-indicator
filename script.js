
const API_URL =
    "https://8igfpsu19h.execute-api.us-east-1.amazonaws.com/default/DevOpsPipelineEventProcessor";

// Dashboard elements
const runButton = document.getElementById("runPipeline");
const mainStatus = document.getElementById("mainStatus");
const statusDescription = document.getElementById("statusDescription");

const totalBuilds = document.getElementById("totalBuilds");
const successfulBuilds = document.getElementById("successfulBuilds");
const failedBuilds = document.getElementById("failedBuilds");
const successRate = document.getElementById("successRate");

const historyTable = document.getElementById("historyTable");
const logContainer = document.getElementById("logContainer");

// Add activity log
function addLog(message, type = "") {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;

    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = new Date().toLocaleTimeString();

    const text = document.createElement("span");
    text.textContent = message;

    entry.append(time, text);
    logContainer.prepend(entry);
}

// Convert backend status into dashboard status
function getRunStatus(run) {
    if (run.status === "in_progress") {
        return {
            label: "RUNNING",
            className: "running"
        };
    }

    if (run.conclusion === "success") {
        return {
            label: "SUCCESS",
            className: "success"
        };
    }

    if (run.conclusion === "failure") {
        return {
            label: "FAILED",
            className: "failure"
        };
    }

    if (run.conclusion === "cancelled") {
        return {
            label: "CANCELLED",
            className: "cancelled"
        };
    }

    if (run.status === "queued") {
        return {
            label: "QUEUED",
            className: "queued"
        };
    }

    return {
        label: "UNKNOWN",
        className: "unknown"
    };
}

// Update statistics using real records
function updateStats(runs) {
    const total = runs.length;

    const successful = runs.filter(
        run => run.conclusion === "success"
    ).length;

    const failed = runs.filter(
        run => run.conclusion === "failure"
    ).length;

    // Running executions are excluded from the success-rate calculation
    const completed = runs.filter(
        run => run.conclusion === "success" ||
               run.conclusion === "failure" ||
               run.conclusion === "cancelled"
    ).length;

    const rate = completed === 0
        ? 0
        : Math.round((successful / completed) * 100);

    totalBuilds.textContent = total;
    successfulBuilds.textContent = successful;
    failedBuilds.textContent = failed;
    successRate.textContent = `${rate}%`;
}

// Display latest execution status
function updateLatestStatus(runs) {
    if (runs.length === 0) {
        mainStatus.textContent = "No executions found";
        statusDescription.textContent =
            "Waiting for a GitHub Actions execution.";
        return;
    }

    const latest = runs[0];
    const status = getRunStatus(latest);

    if (status.className === "running") {
        mainStatus.textContent = "Pipeline Running";
    } else if (status.className === "success") {
        mainStatus.textContent = "Pipeline Successful";
    } else if (status.className === "failure") {
        mainStatus.textContent = "Pipeline Failed";
    } else if (status.className === "cancelled") {
        mainStatus.textContent = "Pipeline Cancelled";
    } else if (status.className === "queued") {
        mainStatus.textContent = "Pipeline Queued";
    } else {
        mainStatus.textContent = "Pipeline Status Unknown";
    }

    statusDescription.textContent =
        `Latest run: ${latest.run_id} | Branch: ${latest.branch}`;
}

// Display actual execution history
function updateHistory(runs) {
    historyTable.innerHTML = "";

    if (runs.length === 0) {
        historyTable.innerHTML =
            '<tr><td colspan="3" class="empty-state">No executions found.</td></tr>';
        return;
    }

    runs.forEach(run => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = `#${run.run_id}`;

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        const status = getRunStatus(run);

        badge.className = `status-pill ${status.className}`;
        badge.textContent = status.label;

        statusCell.appendChild(badge);

        const timeCell = document.createElement("td");
        const date = new Date(run.received_at);

        timeCell.textContent = isNaN(date.getTime())
            ? "Unknown"
            : date.toLocaleString();

        row.append(idCell, statusCell, timeCell);
        historyTable.appendChild(row);
    });
}

// Fetch real records from AWS
async function loadPipelineData() {
    try {
        runButton.disabled = true;
        runButton.textContent = "Refreshing...";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        const runs = data.runs || [];

        updateStats(runs);
        updateLatestStatus(runs);
        updateHistory(runs);

        addLog(
            `Retrieved ${runs.length} pipeline records from AWS.`,
            "success"
        );

    } catch (error) {
        console.error("Dashboard error:", error);

        mainStatus.textContent = "Connection Error";
        statusDescription.textContent =
            "Unable to retrieve pipeline records from AWS.";

        addLog("Failed to retrieve pipeline records.", "error");

    } finally {
        runButton.disabled = false;
        runButton.textContent = "↻ Refresh Data";
    }
}

// Refresh button
runButton.addEventListener("click", loadPipelineData);

// Load data when dashboard opens
loadPipelineData();

// Check AWS every 5 seconds for live status updates
setInterval(loadPipelineData, 5000);
