// ================================
// SUPABASE CONFIG
// ================================
const SUPABASE_URL = "https://lftgnpogyyfprikkxqpp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6GvqSKGhpfMPI3MJoj3mWg_GF0pllIf";

const supabaseClient = window.supabase?.createClient?.(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

if (!supabaseClient) {
    console.error("Supabase SDK not loaded or failed to initialize.");
}

// ================================
// LOAD MAINTENANCE RECORDS
// ================================
async function loadMaintenance() {

    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from("Maintenance")
        .select("*")
        .order("Maintenance ID", {
            ascending: false
        });

    if (error) {
        console.error(error);
        return;
    }

    const tableBody = document.getElementById("maintenanceTableBody");
    tableBody.innerHTML = "";

    data.forEach(record => {
        tableBody.innerHTML += `
        <tr>
            <td>${record["Maintenance ID"]}</td>
            <td>${record.Asset || ""}</td>
            <td>${record.Issue || ""}</td>
            <td>${record.Technician || ""}</td>
            <td>${record.Status || ""}</td>
            <td>${record["Completion Date"] || ""}</td>
            <td>
                <button onclick="editMaintenance('${record["Maintenance ID"]}')">Edit</button>
                <button onclick="deleteMaintenance('${record["Maintenance ID"]}')">Delete</button>
            </td>
        </tr>
        `;
    });

    loadSummaryCounts(data);
}

// ================================
// SAVE RECORD
// ================================
document
.getElementById("maintenanceForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const id = document.getElementById("maintenanceId").value;

    const completionDateValue = document.getElementById("completionDate").value;
    const maintenance = {
        Asset: document.getElementById("asset").value,
        Issue: document.getElementById("description").value,
        Technician: document.getElementById("technician").value,
        Status: document.getElementById("status").value,
        "Completion Date": completionDateValue ? completionDateValue : null
    };

    console.log("Submitting maintenance record:", maintenance, { id });

    const response = id === ""
        ? await supabaseClient.from("Maintenance").insert([maintenance])
        : await supabaseClient.from("Maintenance").update(maintenance).eq("Maintenance ID", Number(id));

    if (response.error) {
        console.error("Supabase insert/update error:", response.error, response);
        alert(response.error.message);
    } else {
        console.log("Supabase response:", response);
        alert("Saved Successfully");
        document.getElementById("maintenanceForm").reset();
        document.getElementById("maintenanceId").value = "";
        loadMaintenance();
    }

});

// ================================
// EDIT
// ================================
async function editMaintenance(id){

    if (!supabaseClient) return;

    const {data,error} = await supabaseClient
        .from("Maintenance")
        .select("*")
        .eq("Maintenance ID",id)
        .single();

    if(error){
        alert(error.message);
        return;
    }

    document.getElementById("maintenanceId").value=data["Maintenance ID"];
    document.getElementById("asset").value=data.Asset;
    document.getElementById("description").value=data.Issue;
    document.getElementById("status").value=data.Status;
    document.getElementById("technician").value=data.Technician;
    document.getElementById("completionDate").value=data["Completion Date"];

}

// ================================
// DELETE
// ================================
async function deleteMaintenance(id){

    if(!confirm("Delete this maintenance record?"))
        return;

    if (!supabaseClient) return;

    const {error}=await supabaseClient
        .from("Maintenance")
        .delete()
        .eq("Maintenance ID",id);

    if(error){
        alert(error.message);
    }else{
        loadMaintenance();
    }
}

// ================================
// LOAD SUMMARY COUNTS
// ================================
function loadSummaryCounts(records = []) {
    const counts = {
        pendingCount: 0,
        inProgressCount: 0,
        completedCount: 0
    };

    if (records.length) {
        records.forEach(record => {
            if (record.Status === "Pending") counts.pendingCount += 1;
            if (record.Status === "In Progress") counts.inProgressCount += 1;
            if (record.Status === "Completed") counts.completedCount += 1;
        });
    } else {
const statusCounts = {
        Pending: "pendingCount",
        "In Progress": "inProgressCount",
        Completed: "completedCount"
    };

    records.forEach(record => {
        const key = statusCounts[record.Status];
        if (key) counts[key] += 1;
    });

    Object.entries(counts).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (el) el.textContent = value;
    });
    return;
    }

    Object.entries(counts).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (el) el.textContent = value;
    });
}

// ================================
// INITIALIZE
// ================================
loadMaintenance();