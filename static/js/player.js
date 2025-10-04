document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const team = localStorage.getItem("team");

  const nameSpan = document.getElementById("player-name");
  const teamSpan = document.getElementById("player-team");
  const scoreSpan = document.getElementById("player-score");
  const winnerRunnerMsg = document.getElementById("winner-runner-msg");

  const btnScan = document.getElementById("btn-scan");
  const linksContainer = document.getElementById("links-container");
  const leaderboard = document.getElementById("leaderboard");

  // Dummy links (replace later with your actual links)
  const dummyLinks = Array.from({ length: 15 }, (_, i) => `https://example.com/link${i+1}`);

  // ------------------------------
  // Load Player Info
  // ------------------------------
  async function loadPlayer() {
    if (!username || !team) {
      alert("You are not logged in!");
      window.location.href = "/";
      return;
    }

    nameSpan.textContent = username;
    teamSpan.textContent = team;

    const res = await fetch("/api/players");
    const data = await res.json();
    const player = data.players.find(p => p.username === username);

    if (player) {
      scoreSpan.textContent = player.score;
      if (player.role === "winner") {
        winnerRunnerMsg.textContent = "🎉 You are the WINNER!";
      } else if (player.role === "runner") {
        winnerRunnerMsg.textContent = "🥈 You are the RUNNER-UP!";
      } else {
        winnerRunnerMsg.textContent = "";
      }
    }
  }

  // ------------------------------
  // Load Leaderboard
  // ------------------------------
  async function loadLeaderboard() {
    const res = await fetch("/api/players");
    const data = await res.json();

    leaderboard.innerHTML = "";
    data.players
      .sort((a, b) => b.score - a.score)
      .forEach((p, idx) => {
        const li = document.createElement("li");
        li.textContent = `${idx + 1}. ${p.username} (Team ${p.team}) - ${p.score}`;
        if (p.role === "winner") li.textContent += " 🏆";
        if (p.role === "runner") li.textContent += " 🥈";
        leaderboard.appendChild(li);
      });
  }

  // ------------------------------
  // Scan Button → Show Links
  // ------------------------------
  if (btnScan) {
    btnScan.addEventListener("click", () => {
      linksContainer.innerHTML = "";
      dummyLinks.forEach((link, idx) => {
        const btn = document.createElement("button");
        btn.textContent = `Link ${idx + 1}`;
        btn.classList.add("px-3", "py-2", "bg-green-500", "text-white", "rounded-lg", "hover:bg-green-700");
        btn.addEventListener("click", async () => {
          const res = await fetch("/api/player/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, points: 5 })
          });
          const r = await res.json();
          if (r.ok) {
            await loadPlayer();
            await loadLeaderboard();
            btn.disabled = true;
            btn.classList.add("opacity-50");
          } else {
            alert(r.error);
          }
        });
        linksContainer.appendChild(btn);
      });
      linksContainer.classList.remove("hidden"); // <-- show links
    });
  }

  // ------------------------------
  // Auto refresh every 5 seconds
  // ------------------------------
  setInterval(() => {
    loadPlayer();
    loadLeaderboard();
  }, 5000);

  loadPlayer();
  loadLeaderboard();
});
