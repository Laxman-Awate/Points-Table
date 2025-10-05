// static/js/Main.js

let adminTeam = localStorage.getItem("adminTeam");
let adminName = localStorage.getItem("adminName");

if (!adminTeam || !adminName) {
    alert("Please login as admin again!");
    window.location.href = "/";
}

document.getElementById("admin-name").innerText = adminName;
document.getElementById("admin-team").innerText = "Team " + adminTeam;

async function updateTeamPoints(fieldId) {
    const points = prompt(`Enter new points for ${fieldId.replace("_points", "").toUpperCase()}:`);
    if (!points) return;

    try {
        const res = await fetch("/api/admin/update_points", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                team: adminTeam,
                field: fieldId,
                points: parseInt(points)
            })
        });

        const data = await res.json();
        if (data.ok) {
            alert(`${fieldId} updated successfully!`);
            loadLeaderboard();
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

// Load leaderboard data
async function loadLeaderboard() {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    if (!data.ok) return;

    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";
    data.leaderboard.forEach((t, i) => {
        const row = `
        <tr>
          <td>${i + 1}</td>
          <td>Team ${t.team}</td>
          <td>${t.qr}</td>
          <td>${t.treasure}</td>
          <td>${t.game1}</td>
          <td>${t.game2}</td>
          <td>${t.reel}</td>
          <td><b>${t.total}</b></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Bind buttons
document.getElementById("update-treasure").addEventListener("click", () => updateTeamPoints("treasure_points"));
document.getElementById("update-game1").addEventListener("click", () => updateTeamPoints("game1_points"));
document.getElementById("update-game2").addEventListener("click", () => updateTeamPoints("game2_points"));
document.getElementById("update-reel").addEventListener("click", () => updateTeamPoints("reel_points"));

// Initial load
loadLeaderboard();
