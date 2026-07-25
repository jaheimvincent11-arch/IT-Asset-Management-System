//=========================
// SUPABASE
//=========================
const supabaseUrl = "https://lftgnpogyyfprikkxqpp.supabase.co";
const supabaseKey = "sb_publishable_6GvqSKGhpfMPI3MJoj3mWg_GF0pllIf";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

//=========================
// ELEMENTS
//=========================
const reportTable = document.getElementById("reportTableBody");

const totalAssets = document.getElementById("totalAssets");
const assignedAssets = document.getElementById("assignedAssets");
const availableAssets = document.getElementById("availableAssets");
const repairAssets = document.getElementById("repairAssets");
const maintenanceAssets = document.getElementById("maintenanceAssets");

// Chart canvases
const statusChartCanvas = document.getElementById("statusChart");
const categoryChartCanvas = document.getElementById("categoryChart");
const purchaseChartCanvas = document.getElementById("purchaseChart");

// Global chart instances (to allow destroying on refresh)
let statusChart = null;
let categoryChart = null;
let purchaseChart = null;

// Helper to normalize report/asset field names across schema variations
function getReportFields(item) {
    return {
        tag: item["Asset Tag"] || item.asset_tag || item.Asset_Tag || item.report_id || item.Report_ID || item.id || "-",
        name: item["Names"] || item["Name"] || item["Asset Name"] || item.asset_name || item.report_name || item.title || item.name || "-",
        category: item["Category"] || item.category || item.Category_ID || item["Category ID"] || "-",
        assignedTo: item["Assigned To"] || item.assigned_to || item.Assigned_To || item.assigned_user || item.user || "-",
        status: item["Status"] || item.status || item.Status || "Unknown",
        purchaseDate: item["Purchase Date"] || item["Purchase_Date"] || item.purchase_date || item.Purchase_date || item.report_date || item.Date || item.created_at || "-"
    };
}

//=========================
// LOAD REPORTS FROM SUPABASE
//=========================
async function fetchReportsData() {
    // 1. Primary target: "Reports" table
    let { data: reports, error } = await supabaseClient
        .from("Reports")
        .select("*");

    // 2. Fallback to lowercase "reports" if needed
    if (error || !reports) {
        const fallbackLower = await supabaseClient.from("reports").select("*");
        if (!fallbackLower.error && fallbackLower.data) {
            reports = fallbackLower.data;
            error = null;
        }
    }

    // 3. Fallback to "Assets" table if "Reports" table is empty or doesn't exist
    if (error || !reports || reports.length === 0) {
        const fallbackAssets = await supabaseClient.from("Assets").select("*");
        if (!fallbackAssets.error && fallbackAssets.data && fallbackAssets.data.length > 0) {
            reports = fallbackAssets.data;
            error = null;
        }
    }

    if (error) {
        console.error("Supabase error loading reports:", error);
    }

    return reports || [];
}

async function loadReports() {
    const reports = await fetchReportsData();

    createTable(reports);
    createSummary(reports);
    createStatusData(reports);
    createCategoryData(reports);
    createPurchaseData(reports);
}

//=========================
// TABLE
//=========================
function createTable(reports) {
    reportTable.innerHTML = "";
    if (reports.length === 0) {
        reportTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 20px;">No report data found in Supabase.</td></tr>`;
        return;
    }
    reports.forEach(report => {
        const item = getReportFields(report);
        reportTable.innerHTML += `
        <tr>
            <td>${item.tag}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.assignedTo}</td>
            <td>${item.status}</td>
            <td>${item.purchaseDate}</td>
        </tr>
        `;
    });
}

//=========================
// SUMMARY
//=========================
function createSummary(reports) {
    totalAssets.textContent = reports.length;
    assignedAssets.textContent = reports.filter(r => getReportFields(r).status.toLowerCase() === "assigned").length;
    availableAssets.textContent = reports.filter(r => getReportFields(r).status.toLowerCase() === "available").length;
    repairAssets.textContent = reports.filter(r => getReportFields(r).status.toLowerCase() === "repair").length;
    maintenanceAssets.textContent = reports.filter(r => getReportFields(r).status.toLowerCase() === "maintenance").length;
}

//=========================
// STATUS CHART
//=========================
function createStatusData(reports) {
    const statusCounts = {};
    reports.forEach(report => {
        const status = getReportFields(report).status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(statusChartCanvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336", "#9c27b0"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { boxWidth: 10, font: { size: 11 } }
                }
            }
        }
    });
}

//=========================
// CATEGORY CHART
//=========================
function createCategoryData(reports) {
    const categoryCounts = {};
    reports.forEach(report => {
        const category = getReportFields(report).category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(categoryChartCanvas, {
        type: "bar",
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                label: "Reports / Assets",
                data: Object.values(categoryCounts),
                backgroundColor: "#2196f3",
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

//=========================
// PURCHASE CHART
//=========================
function createPurchaseData(reports) {
    const monthlyPurchases = {};
    reports.forEach(report => {
        const dateStr = getReportFields(report).purchaseDate;
        let month = "N/A";
        if (dateStr && dateStr !== "-") {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                month = d.toLocaleString("default", { month: "short", year: "numeric" });
            }
        }
        monthlyPurchases[month] = (monthlyPurchases[month] || 0) + 1;
    });

    if (purchaseChart) purchaseChart.destroy();

    purchaseChart = new Chart(purchaseChartCanvas, {
        type: "line",
        data: {
            labels: Object.keys(monthlyPurchases),
            datasets: [{
                label: "Monthly Trend",
                data: Object.values(monthlyPurchases),
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

//=========================
// SEARCH
//=========================
document.getElementById("searchReport").addEventListener("keyup", function () {
    const value = this.value.toLowerCase();
    const rows = reportTable.querySelectorAll("tr");
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
});

//=========================
// EXPORT CSV
//=========================
document.getElementById("exportCSV").addEventListener("click", async () => {
    const reports = await fetchReportsData();

    if (!reports || reports.length === 0) {
        alert("No report data available to export.");
        return;
    }
    let csv = "Asset Tag,Asset Name,Category,Assigned To,Status,Purchase Date\n";
    reports.forEach(report => {
        const item = getReportFields(report);
        csv += `"${item.tag}","${item.name}","${item.category}","${item.assignedTo}","${item.status}","${item.purchaseDate}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Reports_Data.csv";
    a.click();
});

//=========================
// REFRESH
//=========================
document.getElementById("refreshReport").addEventListener("click", loadReports);

//=========================
// START
//=========================
loadReports();
