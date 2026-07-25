// ===============================
// Supabase Configuration
// ===============================
const SUPABASE_URL = "https://lftgnpogyyfprikkxqpp.supabase.co";
const SUPABASE_KEY = 'sb_publishable_6GvqSKGhpfMPI3MJoj3mWg_GF0pllIf';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===============================
// Page Load
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadEmployees();
    loadAssets();

    document.getElementById("assetForm").addEventListener("submit", saveAsset);
    document.getElementById("clearBtn").addEventListener("click", clearForm);
    document.getElementById("searchBtn").addEventListener("click", searchAssets);
});

// ===============================
// Load Categories
// ===============================
async function loadCategories() {

    const { data, error } = await supabaseClient
        .from("Categories")
        .select("*")
        .order("Category_Name");

    if (error) {
        console.error(error);
        return;
    }

    const select = document.getElementById("categoryId");
    select.innerHTML = `<option value="">Select Category</option>`;

    data.forEach(category => {

        select.innerHTML += `
            <option value="${category.Category_ID}">
                ${category.Category_Name}
            </option>
        `;
    });

}

// ===============================
// Load Employees
// ===============================
async function loadEmployees() {

    const { data, error } = await supabaseClient
        .from("Profiles")
        .select("*")
        .order("User ID");

    if (error) {
        console.error(error);
        return;
    }

    const select = document.getElementById("assignedTo");

    select.innerHTML = `<option value="">Select Employee</option>`;

    data.forEach(employee => {

        select.innerHTML += `
            <option value="${employee["User ID"]}">
                ${employee["Login ID"] || employee["Email"] || ""}
            </option>
        `;

    });

}

// ===============================
// Load Assets
// ===============================
async function loadAssets() {

    const { data, error } = await supabaseClient
        .from("Assets")
        .select("*")
        .order("Names");

    if (error) {
        console.error(error);
        return;
    }

    displayAssets(data);

}

// ===============================
// Display Assets
// ===============================
function displayAssets(data) {

    const tbody = document.getElementById("assetTableBody");

    tbody.innerHTML = "";

    document.getElementById("assetCount").textContent =
        `${data.length} assets`;

    if (data.length === 0) {

        tbody.innerHTML = `
        <tr>
            <td colspan="8">No assets found.</td>
        </tr>
        `;

        return;

    }

    data.forEach(asset => {

        const assetTag = asset["Asset Tag"] || asset.asset_tag || "";
        const assetName = asset["Names"] || asset["Name"] || asset["Asset Name"] || asset.asset_name || "";
        const assignedTo = asset["Assigned To"] || asset.assigned_to || "";
        const category = asset["Category"] || asset.category_id || asset["Category ID"] || "";
        const status = asset["Status"] || asset.status || "";
        const location = asset["Location"] || asset.location || "";
        const brand = asset["Brand"] || asset.brand || "";

        tbody.innerHTML += `

        <tr>

            <td>${assetTag}</td>

            <td>${assetName}</td>

            <td>${category}</td>

            <td>${brand}</td>

            <td>${assignedTo}</td>

            <td>${location}</td>

            <td>${status}</td>

            <td>

                <button onclick="editAsset('${assetTag}')">
                    Edit
                </button>

                <button onclick="deleteAsset('${assetTag}')">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// ===============================
// Save Asset
// ===============================
async function saveAsset(e) {

    e.preventDefault();

    const id = document.getElementById("assetId").value;

    const asset = {

        Names: document.getElementById("assetName").value,

        Category: document.getElementById("categoryId").value,

        Brand: document.getElementById("brand").value,

        Model: document.getElementById("model").value,

        "Serial Number": document.getElementById("serialNumber").value,

        "Asset Tag": document.getElementById("assetTag").value,

        "Purchase Date": document.getElementById("purchaseDate").value || null,

        "Purchase Cost": document.getElementById("purchaseCost").value || null,

        Supplier: document.getElementById("supplier").value,

        Location: document.getElementById("location").value,

        "Assigned To": document.getElementById("assignedTo").value || null,

        Status: document.getElementById("status").value,

        Condition: document.getElementById("condition").value,

        "Warranty Expiry":
            document.getElementById("warrantyExpiry").value || null,

        Notes: document.getElementById("notes").value

    };

    let error;

    if (id === "") {

        ({ error } = await supabaseClient
            .from("Assets")
            .insert(asset));

    } else {

        ({ error } = await supabaseClient
            .from("Assets")
            .update(asset)
            .eq("Asset Tag", id));

    }

    if (error) {

        alert(error.message);
        return;

    }

    alert("Asset saved successfully.");

    clearForm();

    loadAssets();

}

// ===============================
// Edit Asset
// ===============================
async function editAsset(id) {

    const { data, error } = await supabaseClient
        .from("Assets")
        .select("*")
        .eq("Asset Tag", id)
        .single();

    if (error) {

        alert(error.message);
        return;

    }

    document.getElementById("assetId").value = data["Asset Tag"] || data.asset_tag || "";
    document.getElementById("assetName").value = data["Names"] || data["Name"] || data.asset_name || "";
    document.getElementById("categoryId").value = data["Category"] || data.category_id || "";
    document.getElementById("brand").value = data["Brand"] || data.brand || "";
    document.getElementById("model").value = data["Model"] || data.model || "";
    document.getElementById("serialNumber").value = data["Serial Number"] || data.serial_number || "";
    document.getElementById("assetTag").value = data["Asset Tag"] || data.asset_tag || "";
    document.getElementById("purchaseDate").value = data["Purchase Date"] || data.purchase_date || "";
    document.getElementById("purchaseCost").value = data["Purchase Cost"] || data.purchase_cost || "";
    document.getElementById("supplier").value = data["Supplier"] || data.supplier || "";
    document.getElementById("location").value = data["Location"] || data.location || "";
    document.getElementById("assignedTo").value = data["Assigned To"] || data.assigned_to || "";
    document.getElementById("status").value = data["Status"] || data.status || "";
    document.getElementById("condition").value = data["Condition"] || data.condition || "";
    document.getElementById("warrantyExpiry").value =
        data["Warranty Expiry"] || data.warranty_expiry || "";
    document.getElementById("notes").value = data["Notes"] || data.notes || "";

}

// ===============================
// Delete Asset
// ===============================
async function deleteAsset(id) {

    if (!confirm("Delete this asset?"))
        return;

    const { error } = await supabaseClient
        .from("Assets")
        .delete()
        .eq("Asset Tag", id);

    if (error) {

        alert(error.message);
        return;

    }

    loadAssets();

}

// ===============================
// Search
// ===============================
async function searchAssets() {

    const search =
        document.getElementById("searchInput").value.toLowerCase();

    const status =
        document.getElementById("statusFilter").value;

    const { data } = await supabaseClient
        .from("Assets")
        .select("*");

    let results = data;

    if (search !== "") {

        results = results.filter(asset => {
            const assetName = (asset["Name"] || asset["Asset Name"] || asset.asset_name || "").toLowerCase();
            const assetTag = (asset["Asset Tag"] || asset.asset_tag || "").toLowerCase();
            const serialNumber = (asset["Serial Number"] || asset.serial_number || "").toLowerCase();
            return assetName.includes(search) || assetTag.includes(search) || serialNumber.includes(search);
        });

    }

    if (status !== "") {

        results = results.filter(asset =>
            (asset["Status"] || asset.status || "") === status);

    }

    displayAssets(results);

}

// ===============================
// Clear Form
// ===============================
function clearForm() {

    document.getElementById("assetForm").reset();

    document.getElementById("assetId").value = "";

}