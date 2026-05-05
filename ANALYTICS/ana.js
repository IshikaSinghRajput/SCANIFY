function goBack() {
    window.location.href = "../Dashboard/dashboard.html";
}

window.addEventListener("DOMContentLoaded", () => {

    const currentUser = localStorage.getItem("loggedInUser");

    if (!currentUser) {
        window.location.href = "../User/login.html";
        return;
    }

    const userData = JSON.parse(localStorage.getItem(currentUser)) || { products: [] };
    const products = userData.products;

    let total = 0, expired = 0, soon = 0, active = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    products.forEach(p => {
        const expiry = new Date(p.expiry);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        total++;

        if (daysLeft < 0) expired++;
        else if (daysLeft <= 5) soon++;
        else active++;
    });

    document.getElementById("total").textContent = total;
    document.getElementById("expired").textContent = expired;
    document.getElementById("soon").textContent = soon;
    document.getElementById("active").textContent = active;

    renderCharts(expired, soon, active);
});

function renderCharts(expired, soon, active) {

    new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: ["Expired", "Active", "Expiring Soon"],
            datasets: [{
                data: [expired, active, soon],
                backgroundColor: ["#0f172a", "#39FF14", "#111827"],
                borderColor: "#39FF14",
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: { 
                        color: "#22c55e",
                        font: { size: 14, weight: 'bold' },
                        padding: 20
                    }
                }
            }
        }
    });

    new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: ["Expired", "Soon", "Active"],
            datasets: [{
                data: [expired, soon, active],
                backgroundColor: "#22c55e"
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "#22c55e" }
                },
                x: {
                    ticks: { color: "#22c55e" }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}