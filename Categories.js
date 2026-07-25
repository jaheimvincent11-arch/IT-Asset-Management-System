(() => {
    function normalizeSupabaseUrl(value = "") {
        if (!value) return "https://lftgnpogyyfprikkxqpp.supabase.co";

        try {
            const parsed = new URL(value.includes("://") ? value : `https://${value}`);
            if (parsed.hostname.endsWith(".supabase.co")) {
                return `https://${parsed.hostname}`;
            }
        } catch (error) {
            console.warn("Unable to parse Supabase URL, using the raw value.", error);
        }

        return value.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    }

    const supabaseUrl = normalizeSupabaseUrl(window.SUPABASE_URL);
    const supabaseKey = window.SUPABASE_ANON_KEY || "sb_publishable_6GvqSKGhpfMPI3MJoj3mWg_GF0pllIf";

    if (!window.supabase) {
        console.error("Supabase SDK failed to load.");
        return;
    }

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    const form = document.getElementById("categoryForm");
    const tableBody = document.getElementById("tableBody");
    const listContainer = document.getElementById("categories-list");
    const statusMessage = document.getElementById("statusMessage");

    const tableName = "Categories";
    const idColumn = "Category_ID";
    const nameColumn = "Category_Name";
    const descriptionColumn = "Description";

    let editId = null;

    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    }

    function setStatus(message, isError = false) {
        if (!statusMessage) return;
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "crimson" : "#2e7d32";
    }

    async function loadCategories() {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select(`${idColumn},${nameColumn},${descriptionColumn}`)
                .order(nameColumn, { ascending: true });

            if (error) throw error;

            if (tableBody) {
                tableBody.innerHTML = "";

                if (!data || data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No categories found.</td></tr>';
                } else {
                    data.forEach((category) => {
                        const description = category[descriptionColumn] ?? "";
                        tableBody.innerHTML += `
                            <tr>
                                <td>${escapeHtml(category[idColumn] ?? "")}</td>
                                <td>${escapeHtml(category[nameColumn] ?? "")}</td>
                                <td>${escapeHtml(description)}</td>
                                <td>
                                    <button class="btn" type="button" onclick="editCategory('${category[idColumn]}', '${escapeHtml(category[nameColumn] ?? "").replace(/'/g, "\\'")}', '${escapeHtml(description).replace(/'/g, "\\'")}')">Edit</button>
                                    <button class="btn" type="button" onclick="deleteCategory('${category[idColumn]}')">Delete</button>
                                </td>
                            </tr>
                        `;
                    });
                }
            }

            if (listContainer) {
                listContainer.innerHTML = "";
                if (data && data.length > 0) {
                    data.forEach((category) => {
                        const description = category[descriptionColumn] ?? "";
                        listContainer.innerHTML += `
                            <div>
                                <h3>${escapeHtml(category[nameColumn] ?? "")}</h3>
                                <p>${escapeHtml(description)}</p>
                            </div>
                        `;
                    });
                }
            }

            setStatus("Categories loaded.");
        } catch (error) {
            console.error(error);
            setStatus(error.message || "Unable to load categories.", true);
        }
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const description = document.getElementById("description").value.trim();

            if (!name) {
                setStatus("Category name is required.", true);
                return;
            }

            try {
                const payload = { [nameColumn]: name };
                if (description) {
                    payload[descriptionColumn] = description;
                }

                if (editId === null) {
                    const { error } = await supabase
                        .from(tableName)
                        .insert([payload]);

                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from(tableName)
                        .update(payload)
                        .eq(idColumn, editId);

                    if (error) throw error;
                    editId = null;
                }

                form.reset();
                setStatus(editId === null ? "Category saved." : "Category updated.");
                await loadCategories();
            } catch (error) {
                console.error(error);
                setStatus(error.message || "Unable to save category.", true);
            }
        });
    }

    window.editCategory = function (id, name, description) {
        document.getElementById("name").value = name || "";
        document.getElementById("description").value = description || "";
        editId = id;
        setStatus("Editing category.");
    };

    window.deleteCategory = async function (id) {
        if (!confirm("Delete this category?")) return;

        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq(idColumn, id);

            if (error) throw error;
            await loadCategories();
            setStatus("Category deleted.");
        } catch (error) {
            console.error(error);
            setStatus(error.message || "Unable to delete category.", true);
        }
    };

    window.uploadCSV = async function () {
        const fileInput = document.getElementById("csvFile");

        if (!fileInput || !fileInput.files.length) {
            alert("Select a CSV file first");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            const text = e.target.result.trim();
            const rows = text.split("\n");
            const dataToInsert = [];

            rows.forEach((row) => {
                const cols = row.split(",");
                const name = cols[0]?.trim();
                const description = cols[1]?.trim() || "";

                if (name) {
                    dataToInsert.push({ name, description });
                }
            });

            try {
                const payloads = dataToInsert.map((item) => {
                    const payload = { [nameColumn]: item.name };
                    if (item.description) {
                        payload[descriptionColumn] = item.description;
                    }
                    return payload;
                });

                const { error } = await supabase.from(tableName).insert(payloads);

                if (error) throw error;

                alert("CSV uploaded successfully!");
                await loadCategories();
            } catch (error) {
                console.error(error);
                alert("Upload failed: " + (error.message || "Unknown error"));
            }
        };

        reader.readAsText(file);
    };

    loadCategories();
})();
