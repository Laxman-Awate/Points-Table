const username = localStorage.getItem("username");
const team = localStorage.getItem("team");
const scoreEl = document.getElementById("player-score");
const linksContainer = document.getElementById("links-container");

if (!username || !team) {
    alert("Please login again!");
    window.location.href = "/";
}

// Display player info
document.getElementById("player-name").textContent = "Name: " + username;
document.getElementById("player-team").textContent = "Team: " + team;

// ---------------- Dummy Links ----------------
// Replace these with your own links later
const dummyLinks = [
    "https://yourlink1.com",
    "https://yourlink2.com",
    "https://yourlink3.com",
    "https://yourlink4.com",
    "https://yourlink5.com"
];

// ---------------- Load Leaderboard ----------------
async function loadLeaderboard() {
    try {
        const res = await fetch("/api/players");
        const data = await res.json();
        const tbody = document.getElementById("leaderboard-body");
        tbody.innerHTML = "";

        // Ensure current player exists
        if (!data.players.some(p => p.username === username)) {
            data.players.push({
                username,
                team,
                qr_points: 0,
                treasure_points: 0,
                game1_points: 0,
                game2_points: 0,
                reel_points: 0,
                score: 0
            });
        }

        // Group players by team
        const teams = {};
        data.players.forEach(p => {
            if (!teams[p.team]) teams[p.team] = [];
            teams[p.team].push(p);
        });

        // Calculate totals & sort teams
        const teamTotals = Object.keys(teams).map(teamId => {
            const total = teams[teamId].reduce((sum, p) => sum + (p.score || 0), 0);
            return { teamId, total, players: teams[teamId] };
        }).sort((a, b) => b.total - a.total);

        let rank = 1;
        teamTotals.forEach(teamData => {
            // Team row
            const teamRow = document.createElement("tr");
            teamRow.classList.add("bg-gray-200", "font-semibold");
            teamRow.innerHTML = `
                <td class="border p-2 text-center">${rank}</td>
                <td class="border p-2 text-center">${teamData.teamId} (Total)</td>
                <td class="border p-2 text-center" colspan="6"></td>
                <td class="border p-2 text-center">${teamData.total}</td>
            `;
            tbody.appendChild(teamRow);

            // Players
            teamData.players.sort((a, b) => b.score - a.score);
            teamData.players.forEach((p, idx) => {
                const row = document.createElement("tr");
                if (p.username === username) {
                    row.classList.add("bg-yellow-100", "font-semibold");
                    scoreEl.textContent = p.score;
                } else {
                    row.classList.add(idx % 2 === 0 ? "bg-white" : "bg-gray-50");
                }
                row.classList.add("hover:bg-gray-100");
                row.innerHTML = `
                    <td class="border p-2 text-center"></td>
                    <td class="border p-2 text-center"></td>
                    <td class="border p-2 text-center">${p.username}</td>
                    <td class="border p-2 text-center">${p.qr_points || 0}</td>
                    <td class="border p-2 text-center">${p.treasure_points || 0}</td>
                    <td class="border p-2 text-center">${p.game1_points || 0}</td>
                    <td class="border p-2 text-center">${p.game2_points || 0}</td>
                    <td class="border p-2 text-center">${p.reel_points || 0}</td>
                    <td class="border p-2 text-center">${p.score}</td>
                `;
                tbody.appendChild(row);
            });
            rank++;
        });
    } catch (err) {
        console.error("Error loading leaderboard:", err);
    }
}

// ---------------- QR Scan ----------------
async function scanQR() {
    try {
        const res = await fetch("/api/player/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.ok) {
            alert(data.reward);
            loadLeaderboard();

            // Show dummy links (replaceable with your own links)
            linksContainer.innerHTML = "";
            dummyLinks.forEach(link => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = link;
                a.textContent = link;
                a.target = "_blank";
                a.className = "text-blue-600 hover:underline";
                li.appendChild(a);
                linksContainer.appendChild(li);
            });
            linksContainer.classList.remove("hidden");
        } else {
            alert("Scan failed: " + data.error);
        }
    } catch (err) {
        console.error("Error scanning QR:", err);
    }
}

// Attach scan button
document.getElementById("btn-scan").addEventListener("click", scanQR);

// Initial load & refresh every 2 seconds
loadLeaderboard();
setInterval(loadLeaderboard, 2000);
