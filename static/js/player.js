// static/js/Player.js

let username = localStorage.getItem("username");
let teamId = localStorage.getItem("team");

if (!username || !teamId) {
    alert("Please register again!");
    window.location.href = "/";
}

document.getElementById("player-name").innerText = username;
document.getElementById("team-id").innerText = "Team " + teamId;

// Function to load team and player data
async function loadPlayerData() {
    try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (!data.ok) return;

        const team = data.leaderboard.find(t => t.team === teamId);
        if (team) {
            document.getElementById("qr-points").innerText = team.qr;
            document.getElementById("treasure-points").innerText = team.treasure;
            document.getElementById("game1-points").innerText = team.game1;
            document.getElementById("game2-points").innerText = team.game2;
            document.getElementById("reel-points").innerText = team.reel;
            document.getElementById("total-points").innerText = team.total;

            // Player personal points
            const player = team.players.find(p => p.username === username);
            document.getElementById("personal-points").innerText = player ? player.score : 0;
        }
    } catch (err) {
        console.error(err);
    }
}

// QR scan function
async function scanQR() {
    try {
        const res = await fetch("/api/player/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });

        const data = await res.json();
        if (data.ok) {
            alert(data.reward);
            loadPlayerData();
        } else {
            alert("Scan failed: " + data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

// Load data when page opens
loadPlayerData();

document.getElementById("scan-btn").addEventListener("click", scanQR);
