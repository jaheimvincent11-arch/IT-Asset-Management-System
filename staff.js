// STAFF DASHBOARD SCRIPT

// Sample data
let assets = [
    { id: "IT001", device: "Dell Latitude Laptop", status: "Active" },
    { id: "IT002", device: "HP Monitor", status: "Active" },
    { id: "IT003", device: "Logitech Keyboard", status: "Active" }
];

// New Request Button
document.addEventListener("DOMContentLoaded", () => {

    const requestBtn = document.querySelector(".add-btn");

    if(requestBtn){
        requestBtn.addEventListener("click", () => {

            const request = prompt("Enter your maintenance/support request:");

            if(request && request.trim() !== ""){

                showNotification("Request submitted successfully!");

                saveRequest(request);
            }
        });
    }

    updateStats();
});

// Save Request
function saveRequest(request){

    let requests =
        JSON.parse(localStorage.getItem("staffRequests")) || [];

    requests.push({
        message: request,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        "staffRequests",
        JSON.stringify(requests)
    );
}

// Notification Popup
function showNotification(message){

    const notification =
        document.createElement("div");

    notification.classList.add("notification");

    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update Dashboard Statistics
function updateStats(){

    const statNumbers =
        document.querySelectorAll(".stat-card h2");

    if(statNumbers.length >= 4){

        statNumbers[0].innerText = assets.length;

        let requests =
            JSON.parse(localStorage.getItem("staffRequests")) || [];

        statNumbers[1].innerText = requests.length;

        statNumbers[2].innerText = requests.length;

        statNumbers[3].innerText =
            Math.floor(Math.random() * 10) + 1;
    }
}

// Clickable Asset Rows
document.addEventListener("click", function(e){

    const row = e.target.closest("tbody tr");

    if(row){

        const assetID =
            row.cells[0].innerText;

        const device =
            row.cells[1].innerText;

        alert(
            `Asset ID: ${assetID}\nDevice: ${device}`
        );
    }
});
const searchInput =
document.getElementById("assetSearch");

if(searchInput){

    searchInput.addEventListener("keyup", () => {

        const value =
        searchInput.value.toLowerCase();

        const rows =
        document.querySelectorAll("tbody tr");

        rows.forEach(row => {

            row.style.display =
            row.innerText.toLowerCase()
            .includes(value)
            ? ""
            : "none";

        });

    });

}