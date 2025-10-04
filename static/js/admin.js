// Elements
const playerSelect = document.getElementById("player-select");
const resultSelect = document.getElementById("result-player-select");
const btnSetImposter = document.getElementById("btn-set-imposter");
const btnWinner = document.getElementById("btn-winner");
const btnRunner = document.getElementById("btn-run");
const btnReset = document.getElementById("btn-reset");
const teamsContainer = document.getElementById("teams-container");

// ------------------------------
// Load Teams & Players
// ------------------------------
async function loadTeams() {
  const res = await fetch("/api/teams");
  const data = await res.json();
  const teams = data.teams;

  // Update teams display
  if (teamsContainer) {
    teamsContainer.innerHTML = "";
    teams.forEach((team, idx) => {
      const div = document.createElement("div");
      div.classList.add("bg-white", "p-4", "rounded-xl", "shadow");
      div.innerHTML = `<h4 class="font-semibold mb-2">Team ${idx + 1}</h4>
                       <ul>${team.map(p => `<li>${p.username} ${p.imposter ? "(Imposter)" : ""} ${p.role ? "(" + p.role + ")" : ""} - Score: ${p.score}</li>`).join("")}</ul>`;
      teamsContainer.appendChild(div);
    });
  }

  // Populate player select for imposter assignment
  if (playerSelect) {
    playerSelect.innerHTML = "";
    teams.flat().forEach(p => {
      const option = document.createElement("option");
      option.value = p.username;
      option.textContent = `${p.username} (Team ${p.team})`;
      playerSelect.appendChild(option);
    });
  }

  // Populate result select
  if (resultSelect) {
    resultSelect.innerHTML = "";
    teams.flat().forEach(p => {
      const option = document.createElement("option");
      option.value = p.username;
      option.textContent = `${p.username} (Team ${p.team})`;
      resultSelect.appendChild(option);
    });
  }
}

// ------------------------------
// Event Listeners
// ------------------------------
if (btnSetImposter) {
  btnSetImposter.addEventListener("click", async () => {
    const username = playerSelect.value;
    if(!username) return alert("Select a player first");

    const res = await fetch("/api/admin/set_imposter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const r = await res.json();
    alert(r.msg || r.error);
    loadTeams();
  });
}

if (btnWinner) {
  btnWinner.addEventListener("click", async () => {
    const username = resultSelect.value;
    if(!username) return alert("Select a player first");

    const res = await fetch("/api/admin/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, role: "winner" })
    });
    const r = await res.json();
    alert(r.msg || r.error);
    loadTeams();
  });
}

if (btnRunner) {
  btnRunner.addEventListener("click", async () => {
    const username = resultSelect.value;
    if(!username) return alert("Select a player first");

    const res = await fetch("/api/admin/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, role: "runner" })
    });
    const r = await res.json();
    alert(r.msg || r.error);
    loadTeams();
  });
}

if (btnReset) {
  btnReset.addEventListener("click", async () => {
    if(!confirm("Are you sure you want to reset the game?")) return;
    const res = await fetch("/api/admin/reset", { method:"POST" });
    const r = await res.json();
    alert(r.msg || r.error);
    loadTeams();
  });
}

// ------------------------------
// Auto refresh every 5 seconds
// ------------------------------
setInterval(loadTeams, 5000);
window.onload = loadTeams;
