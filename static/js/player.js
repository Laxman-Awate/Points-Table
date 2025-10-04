const username = localStorage.getItem("username");
const team = localStorage.getItem("team");
const linksContainer = document.getElementById("links-container");
const leaderboardContainer = document.getElementById("leaderboard-container");

async function loadLinks() {
  const res = await fetch("/api/scan", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username})
  });
  const data = await res.json();
  if(!data.ok) return alert(data.error);

  linksContainer.innerHTML = "";
  data.links.forEach(l=>{
    const btn = document.createElement("button");
    btn.textContent = `${l.url} (+${l.points})`;
    btn.classList.add("px-4","py-2","bg-blue-500","text-white","rounded","m-1");
    btn.onclick = async ()=>{
      await fetch("/api/scan/click", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username, points:l.points})
      });
      loadLeaderboard();
    };
    linksContainer.appendChild(btn);
  });
  loadLeaderboard();
}

async function loadLeaderboard(){
  const res = await fetch("/api/leaderboard");
  const data = await res.json();
  leaderboardContainer.innerHTML = "<h3 class='font-bold mb-2'>Leaderboard</h3>";
  data.forEach((p, idx)=>{
    const div = document.createElement("div");
    div.textContent = `${idx+1}. ${p.username} - ${p.score} pts`;
    if(p.username===username) div.style.fontWeight="bold";
    leaderboardContainer.appendChild(div);
  });
}

setInterval(loadLeaderboard, 3000);
window.onload = loadLinks;
