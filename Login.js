
const supabaseUrl = window.SUPABASE_URL || "https://lftgnpogyyfprikkxqpp.supabase.co";
const supabaseAnonKey = window.SUPABASE_ANON_KEY || "sb_publishable_6GvqSKGhpfMPI3MJoj3mWg_GF0pllIf";

const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

const USER_TABLES = ["Profiles", '"Profiles"', '"User"', "User"];
const USER_ID_COLUMN = "ID USER";
const USER_FULLNAME_COLUMN = "Full Name";
const USER_USERNAME_COLUMN = "Username";
const USER_EMAIL_COLUMN = "Email";
const USER_ROLE_COLUMN = "Role";
const USER_PASSWORD_COLUMN = "Password";

function showError(message) {
    const errorEl = document.getElementById("error");
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function getProfileValue(profile, keys, fallback = "") {
    for (const key of keys) {
        const value = profile?.[key];
        if (value !== undefined && value !== null) {
            const textValue = String(value).trim();
            if (textValue) {
                return textValue;
            }
        }
    }
    return fallback;
}

async function findProfile(email, password, selectedRole) {
    if (!supabaseClient) return null;

    const normalizedInput = (email || "").trim().toLowerCase();
    const normalizedPassword = (password || "").trim();
    const normalizedRole = (selectedRole || "").trim().toLowerCase();
    if (!normalizedInput || !normalizedPassword) return null;

    try {
        let lastError = null;

        for (const tableName of USER_TABLES) {
            const { data, error } = await supabaseClient
                .from(tableName)
                .select("*");

            if (error) {
                lastError = error;
                continue;
            }

            const match = (data || []).find((profile) => {
                const emailValue = getProfileValue(profile, [USER_EMAIL_COLUMN, "email"]).trim().toLowerCase();
                const usernameValue = getProfileValue(profile, [USER_USERNAME_COLUMN, "username"]).trim().toLowerCase();
                const storedPassword = getProfileValue(profile, [USER_PASSWORD_COLUMN, "password"]);
                const roleValue = getProfileValue(profile, [USER_ROLE_COLUMN, "role"]).trim().toLowerCase();

                const loginMatches = emailValue === normalizedInput || usernameValue === normalizedInput;
                const passwordMatches = storedPassword === normalizedPassword || storedPassword.toLowerCase() === normalizedPassword.toLowerCase();
                const roleMatches = !normalizedRole || roleValue === normalizedRole || roleValue === "";

                return loginMatches && passwordMatches && roleMatches;
            });

            if (match) {
                return match;
            }
        }

        if (lastError) {
            console.warn("Profile lookup failed:", lastError);
        }

        return null;
    } catch (dbError) {
        console.warn("Profile lookup error:", dbError);
        return null;
    }
}

async function login() {
    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const selectedRole = document.getElementById("role").value;

    showError("");

    if (!email || !password) {
        showError("Enter email and password");
        return;
    }

    try {
        const profile = await findProfile(email, password, selectedRole);

        if (!profile) {
            showError("No matching Supabase profile found or the password is incorrect.");
            return;
        }

        const role = String(profile[USER_ROLE_COLUMN] || profile.role || selectedRole || "").trim().toLowerCase();
        const userData = {
            id: profile[USER_ID_COLUMN] || profile.id || null,
            email: profile[USER_EMAIL_COLUMN] || profile.email || email,
            username: profile[USER_USERNAME_COLUMN] || profile.username || email,
            role,
            name: profile[USER_FULLNAME_COLUMN] || profile.full_name || profile.name || email,
            department: profile.department || "",
            phone: profile.phone || "",
            avatar_url: profile.avatar_url || ""
        };

        localStorage.setItem("iam_user", JSON.stringify(userData));
        localStorage.setItem("userRole", role);
        localStorage.setItem("role", role);

        if (role === "admin") {
            window.location.href = "Dashboard.html";
        } else {
            window.location.href = "StaffDashboard.html";
        }
    } catch (dbError) {
        console.error("Supabase login failed:", dbError);
        showError("Unable to sign in using your Supabase profile.");
    }
}