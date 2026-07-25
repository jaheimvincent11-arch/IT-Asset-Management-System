let inventory =
JSON.parse(localStorage.getItem("inventory")) || [

{
id:1,
name:"Dell Latitude 5420",
category:"Laptop",
quantity:24,
status:"In Stock"
},

{
id:2,
name:"HP LaserJet Pro",
category:"Printer",
quantity:3,
status:"Low Stock"
}

];

let currentEdit = null;

renderInventory();
updateStats();
checkRole();

/* ======================
   RENDER TABLE
====================== */

function renderInventory(){

const tbody =
document.querySelector("tbody");

tbody.innerHTML = "";

inventory.forEach(item => {

tbody.innerHTML += `

<tr>

<td>${item.name}</td>

<td>${item.category}</td>

<td>

<span class="badge
${item.quantity < 5 ? 'low' : 'success'}">

${item.quantity < 5
? 'Low Stock'
: 'In Stock'}

</span>

</td>

<td>${item.quantity}</td>

<td>

<button onclick="editAsset(${item.id})">

Edit

</button>

<button onclick="deleteAsset(${item.id})">

Delete

</button>

</td>

</tr>

`;

});

saveData();
}

/* ======================
/* ======================
   ADD ASSET
====================== */

function addAsset(){

if(currentEdit !== null){
    updateAsset();
    return;
}

const nameInput = document.getElementById("assetName");
const categoryInput = document.getElementById("assetCategory");
const quantityInput = document.getElementById("assetQuantity");

const name = nameInput ? nameInput.value.trim() : "";
const category = categoryInput ? categoryInput.value.trim() : "";
const quantity = quantityInput ? quantityInput.value.trim() : "";

if(!name || !category || !quantity){

alert("Please fill all fields");
return;

}

inventory.push({

id:Date.now(),

name,

category,

quantity:Number(quantity)

});

if(nameInput) nameInput.value = "";
if(categoryInput) categoryInput.value = "";
if(quantityInput) quantityInput.value = "";

renderInventory();
updateStats();

showNotification("Asset Added");

}

/* ======================
   DELETE
====================== */

function deleteAsset(id){

if(!confirm("Delete asset?")) return;

inventory =
inventory.filter(
item => item.id !== id
);

renderInventory();
updateStats();

showNotification("Asset Deleted");

}

/* ======================
   EDIT
====================== */

function editAsset(id){

const item =
inventory.find(i => i.id === id);

if(!item) return;

currentEdit = id;

document.getElementById("assetName").value =
item.name;

document.getElementById("assetCategory").value =
item.category;

document.getElementById("assetQuantity").value =
item.quantity;

document.getElementById("saveBtn").innerText =
"Update Asset";

}

function updateAsset(){

const nameInput = document.getElementById("assetName");
const categoryInput = document.getElementById("assetCategory");
const quantityInput = document.getElementById("assetQuantity");

const name = nameInput ? nameInput.value.trim() : "";
const category = categoryInput ? categoryInput.value.trim() : "";
const quantity = quantityInput ? quantityInput.value.trim() : "";

if(!name || !category || !quantity){

alert("Please fill all fields");
return;

}

inventory = inventory.map(item => {

if(item.id === currentEdit){

return {

...item,

name,

category,

quantity:Number(quantity)

};

}

return item;

});

currentEdit = null;

const saveBtn = document.getElementById("saveBtn");
if(saveBtn) saveBtn.innerText = "Add Asset";

if(nameInput) nameInput.value = "";
if(categoryInput) categoryInput.value = "";
if(quantityInput) quantityInput.value = "";

renderInventory();
updateStats();

showNotification("Asset Updated");

}

/* ======================
   SEARCH
====================== */

document
.querySelector(".search-box input")
.addEventListener("keyup", function(){

const value =
this.value.toLowerCase();

const rows =
document.querySelectorAll("tbody tr");

rows.forEach(row => {

row.style.display =
row.innerText
.toLowerCase()
.includes(value)

? ""

: "none";

});

});

/* ======================
   STATS
====================== */

function updateStats(){

const totalAssetsElem = document.getElementById("totalAssets");
if(totalAssetsElem){
    totalAssetsElem.innerText = inventory.length;
}

let totalStock = inventory.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
);

const availableStockElem = document.getElementById("availableStock");
if(availableStockElem){
    availableStockElem.innerText = totalStock;
}

let lowStock = inventory.filter(
    item => (Number(item.quantity) || 0) < 5
).length;

const lowStockElem = document.getElementById("lowStock");
if(lowStockElem){
    lowStockElem.innerText = lowStock;
}

let uniqueCategories = new Set(
    inventory
        .map(item => item.category)
        .filter(cat => cat && String(cat).trim() !== "")
).size;

const totalCategoriesElem = document.getElementById("totalCategories");
if(totalCategoriesElem){
    totalCategoriesElem.innerText = uniqueCategories;
}

}

/* ======================
   STORAGE
====================== */

function saveData(){

localStorage.setItem(
"inventory",
JSON.stringify(inventory)
);

}

/* ======================
   ROLE CHECK
====================== */

function checkRole(){

const role =
localStorage.getItem("role");

if(role === "staff"){

document
.querySelectorAll("button")
.forEach(btn=>{

if(btn.innerText === "Delete"){

btn.style.display="none";

}

});

}

}

/* ======================
   NOTIFICATIONS
====================== */

function showNotification(message){

const note =
document.createElement("div");

note.className =
"notification";

note.innerText =
message;

document.body.appendChild(note);

setTimeout(()=>{

note.remove();

},3000);

}
function logout() {
    localStorage.removeItem("userRole");
    window.location.href = "LoginPage.html";
}