let allVehicles = [];

// Elements
const carsGrid = document.querySelector("#carsGrid");
const emptyMessage = document.querySelector("#emptyMessage");
const searchInput = document.querySelector("#searchInput");
const makeFilter = document.querySelector("#makeFilter");
const cityFilter = document.querySelector("#cityFilter");
const priceFilter = document.querySelector("#priceFilter");
const addCarForm = document.querySelector("#addCarForm");
const formStatus = document.querySelector("#formStatus");
const carModal = document.querySelector("#carModal");

// 1. Fetch listings from backend API
async function loadVehicles() {
  try {
    const res = await fetch("api/get_cars.php");
    const json = await res.json();
    if (json.status === "success") {
      allVehicles = json.data;
      renderVehicles(allVehicles);
    }
  } catch (err) {
    console.error("Failed to load listings", err);
  }
}

// 2. Render Cards to DOM
function renderVehicles(vehicles) {
  carsGrid.innerHTML = "";

  if (vehicles.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }
  emptyMessage.classList.add("hidden");

  vehicles.forEach((car) => {
    const isSold = car.status === "Sold";
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between";

    card.innerHTML = `
      <div class="p-5">
        <div class="flex justify-between items-start">
          <span class="text-xs font-semibold px-2 py-0.5 rounded ${isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
            ${car.status}
          </span>
          <span class="text-xs text-gray-500">${car.city}</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mt-2">${car.title}</h3>
        <p class="text-xl font-extrabold text-blue-700 mt-1">PKR ${Number(car.price).toLocaleString()}</p>
        
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-4 border-t pt-3">
          <div><span class="font-medium text-gray-400">Year:</span> ${car.model_year}</div>
          <div><span class="font-medium text-gray-400">Make:</span> ${car.make}</div>
          <div><span class="font-medium text-gray-400">Mileage:</span> ${Number(car.mileage).toLocaleString()} km</div>
          <div><span class="font-medium text-gray-400">City:</span> ${car.city}</div>
        </div>
      </div>

      <div class="bg-gray-50 px-5 py-3 border-t flex justify-between items-center text-xs">
        <button onclick="toggleCarStatus(${car.id}, '${car.status}')" class="font-semibold ${isSold ? 'text-blue-600 hover:underline' : 'text-orange-600 hover:underline'}">
          ${isSold ? 'Mark Available' : 'Mark as Sold'}
        </button>
        <button onclick="deleteCar(${car.id})" class="text-red-500 hover:text-red-700 font-semibold">
          Delete
        </button>
      </div>
    `;
    carsGrid.appendChild(card);
  });
}

// 3. Live Client-Side Filtering
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const selectedMake = makeFilter.value;
  const selectedCity = cityFilter.value;
  const maxPrice = Number(priceFilter.value);

  const filtered = allVehicles.filter((car) => {
    const matchesQuery = car.title.toLowerCase().includes(query);
    const matchesMake = !selectedMake || car.make === selectedMake;
    const matchesCity = !selectedCity || car.city === selectedCity;
    const matchesPrice = !maxPrice || Number(car.price) <= maxPrice;

    return matchesQuery && matchesMake && matchesCity && matchesPrice;
  });

  renderVehicles(filtered);
}

// Event Listeners for Filters
searchInput.addEventListener("input", applyFilters);
makeFilter.addEventListener("change", applyFilters);
cityFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("input", applyFilters);

// 4. Create Vehicle (Form Submit)
addCarForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.textContent = "Saving...";
  formStatus.className = "text-xs font-bold pt-1 text-gray-500";

  const payload = {
    title: document.querySelector("#title").value,
    make: document.querySelector("#make").value,
    model_year: document.querySelector("#model_year").value,
    price: document.querySelector("#price").value,
    mileage: document.querySelector("#mileage").value,
    city: document.querySelector("#city").value
  };

  try {
    const res = await fetch("api/create_car.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === "success") {
      formStatus.textContent = result.message;
      formStatus.className = "text-xs font-bold pt-1 text-green-600";
      addCarForm.reset();
      setTimeout(() => {
        toggleModal(false);
        formStatus.textContent = "";
        loadVehicles();
      }, 700);
    } else {
      formStatus.textContent = result.message;
      formStatus.className = "text-xs font-bold pt-1 text-red-600";
    }
  } catch (err) {
    formStatus.textContent = "Server communication failed.";
    formStatus.className = "text-xs font-bold pt-1 text-red-600";
  }
});

// 5. Update Status (Sold / Available)
async function toggleCarStatus(id, currentStatus) {
  const newStatus = currentStatus === "Available" ? "Sold" : "Available";
  try {
    const res = await fetch("api/update_car.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus })
    });
    const result = await res.json();
    if (result.status === "success") {
      loadVehicles();
    }
  } catch (err) {
    alert("Could not update status");
  }
}

// 6. Delete Car
async function deleteCar(id) {
  if (!confirm("Are you sure you want to delete this listing?")) return;

  try {
    const res = await fetch("api/delete_car.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const result = await res.json();
    if (result.status === "success") {
      loadVehicles();
    }
  } catch (err) {
    alert("Could not delete vehicle listing");
  }
}

// Modal helper
function toggleModal(show) {
  if (show) {
    carModal.classList.remove("hidden");
  } else {
    carModal.classList.add("hidden");
  }
}

// Initial Boot
loadVehicles();