// ==============================
// SUPABASE CONFIGURATION
// ==============================

const supabaseUrl = window.SUPABASE_URL || "https://lftgnpogyyfprikkxqpp.supabase.co";
const supabaseAnonKey = window.SUPABASE_ANON_KEY || "sb_publishable_6GvqSKGhpfMPI3MJoj3mWg_GF0pllIf";


const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

const TABLE_NAME = "User";
const ID_COLUMN = "ID USER";
const NAME_COLUMN = "Full Name";
const USERNAME_COLUMN = "Username";
const EMAIL_COLUMN = "Email";
const ROLE_COLUMN = "Role";
const PASSWORD_COLUMN = "Password";
const AUTH_TABLE_NAME = "Profiles";
const AUTH_ID_COLUMN = "User ID";
const AUTH_LOGIN_COLUMN = "Login ID";
const AUTH_EMAIL_COLUMN = "Email";
const AUTH_ROLE_COLUMN = "Role";
const AUTH_PASSWORD_COLUMN = "Password";

function generateRecordId(prefix = "user") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ==============================
// LOAD USERS
// ==============================

function updateSummaryCards(users) {
    const totalUsersEl = document.getElementById("totalUsersCount");
    const adminUsersEl = document.getElementById("adminUsersCount");
    const staffUsersEl = document.getElementById("staffUsersCount");

    if (!totalUsersEl || !adminUsersEl || !staffUsersEl) return;

    const total = users.length;
    const admins = users.filter((user) => String(user[ROLE_COLUMN] || "").toLowerCase() === "admin").length;
    const staff = users.filter((user) => String(user[ROLE_COLUMN] || "").toLowerCase() === "staff").length;

    totalUsersEl.textContent = total;
    adminUsersEl.textContent = admins;
    staffUsersEl.textContent = staff;
}

async function loadUsers() {

    const table = document.getElementById("usersTableBody");

    if (!table) {
        console.error("usersTableBody not found");
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="6">Loading...</td>
        </tr>
    `;

    if (!supabaseClient) {
        table.innerHTML = `
            <tr>
                <td colspan="6">Supabase SDK not loaded.</td>
            </tr>
        `;
        return;
    }

    const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select(`"${ID_COLUMN}","${NAME_COLUMN}","${USERNAME_COLUMN}","${EMAIL_COLUMN}","${ROLE_COLUMN}"`)
        .order(NAME_COLUMN);

    if (error) {

        table.innerHTML = `
            <tr>
                <td colspan="6">Error loading users.</td>
            </tr>
        `;

        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        updateSummaryCards([]);

        table.innerHTML = `
            <tr>
                <td colspan="6">No users found.</td>
            </tr>
        `;

        return;
    }

    updateSummaryCards(data);
    table.innerHTML = "";

    data.forEach(user => {

        const id = user[ID_COLUMN];
        const fullName = user[NAME_COLUMN] || "";
        const username = user[USERNAME_COLUMN] || "";
        const email = user[EMAIL_COLUMN] || "";
        const role = user[ROLE_COLUMN] || "";

        table.innerHTML += `
        <tr>
            <td>${escapeHtml(id ?? "")}</td>
            <td>${escapeHtml(fullName)}</td>
            <td>${escapeHtml(username)}</td>
            <td>${escapeHtml(email)}</td>
            <td>${escapeHtml(role)}</td>
            <td>
                <button onclick="editUser('${id}')">Edit</button>
                <button onclick="deleteUser('${id}')">Delete</button>
            </td>
        </tr>
        `;

    });

}

// ==============================
// ADD USER
// ==============================

async function addUser() {

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value.trim();

    if (!fullName || !username || !email || !password || !role) {
        alert("Please fill in the required fields.");
        return;
    }

    const userId = generateRecordId("user");
    const profileId = generateRecordId("profile");

    const payload = {
        [ID_COLUMN]: userId,
        [NAME_COLUMN]: fullName,
        [USERNAME_COLUMN]: username,
        [EMAIL_COLUMN]: email,
        [ROLE_COLUMN]: role
    };

    const profilePayload = {
        [AUTH_ID_COLUMN]: profileId,
        [AUTH_LOGIN_COLUMN]: username,
        [AUTH_EMAIL_COLUMN]: email,
        [AUTH_ROLE_COLUMN]: role,
        [AUTH_PASSWORD_COLUMN]: password
    };

    console.log("Inserting into Supabase:", payload);

    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .insert([payload])
        .select();

    if (error) {
        console.error("Insert error:", error);
        alert(error.message || "Unable to add user.");
        return;
    }

    alert("User added successfully.");

    document.getElementById("userForm").reset();

    loadUsers();

}

// ==============================
// DELETE USER
// ==============================

async function deleteUser(id) {

    if (!confirm("Delete this user?"))
        return;

    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .delete()
        .eq(ID_COLUMN, id);

    if (error) {

        alert(error.message);
        return;

    }

    alert("User deleted.");

    loadUsers();

}

// ==============================
// EDIT USER
// ==============================

async function editUser(id) {

    const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select(`"${ID_COLUMN}","${NAME_COLUMN}","${USERNAME_COLUMN}","${EMAIL_COLUMN}","${ROLE_COLUMN}"`)
        .eq(ID_COLUMN, id)
        .single();

    if (error) {

        alert(error.message);
        return;

    }

    document.getElementById("fullName").value = data[NAME_COLUMN] || "";
    document.getElementById("username").value = data[USERNAME_COLUMN] || "";
    document.getElementById("email").value = data[EMAIL_COLUMN] || "";
    document.getElementById("password").value = "";
    document.getElementById("role").value = data[ROLE_COLUMN] || "";

    const button = document.getElementById("saveButton");

    button.innerText = "Update User";

    button.onclick = function () {
        updateUser(id);
    };

}

// ==============================
// UPDATE USER
// ==============================

async function updateUser(id) {

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value.trim();

    const payload = {
        [NAME_COLUMN]: fullName,
        [USERNAME_COLUMN]: username,
        [EMAIL_COLUMN]: email,
        [ROLE_COLUMN]: role
    };

    const profilePayload = {
        [AUTH_LOGIN_COLUMN]: username,
        [AUTH_EMAIL_COLUMN]: email,
        [AUTH_ROLE_COLUMN]: role
    };

    if (password) {
        profilePayload[AUTH_PASSWORD_COLUMN] = password;
    }

    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .update(payload)
        .eq(ID_COLUMN, id);

    if (error) {

        alert(error.message);
        return;

    }

    const { error: profileError } = await supabaseClient
        .from(AUTH_TABLE_NAME)
        .update(profilePayload)
        .eq(AUTH_EMAIL_COLUMN, email);

    if (profileError) {
        console.warn("Profile update failed:", profileError);
    }

    alert("User updated successfully.");

    document.getElementById("userForm").reset();

    const button = document.getElementById("saveButton");

    button.innerText = "Add User";

    button.onclick = addUser;

    loadUsers();

}

// ==============================
// SEARCH USERS
// ==============================

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");
}

function searchUsers() {

    const filter = document
        .getElementById("searchUser")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#usersTableBody tr");

    rows.forEach(row => {

        row.style.display =
            row.innerText.toLowerCase().includes(filter)
                ? ""
                : "none";

    });

}

// ==============================
// PAGE LOAD
// ==============================

window.addUser = addUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.updateUser = updateUser;

document.addEventListener("DOMContentLoaded", () => {

    const userForm = document.getElementById("userForm");

    if (userForm) {
        userForm.addEventListener("submit", (event) => {
            event.preventDefault();
            addUser();
        });
    }

    loadUsers();

});