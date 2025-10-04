async function api(path, method='GET', body=null){
  const opts = {method, headers: {'Content-Type':'application/json'}};
  if(body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  return res.json();
}

let currentUser = null;

// ================= PLAYER FUNCTIONS =================

async function doRegister(){
  const name = document.getElementById('username').value.trim();
  if(!name) return alert('Enter name');

  const r = await api('/api/register', 'POST', {username: name});
  if(r.ok){
    currentUser = name;
    refresh();
  } else {
    alert(r.error || 'error');
  }
}

async function doScan(){
  if(!currentUser) return alert('register first');
  const links = [
    "https://example.com/scan1",
    "https://example.com/scan2",
    "https://example.com/scan3",
    "https://example.com/scan4",
    "https://example.com/scan5"
  ];
  const container = document.getElementById('scan-links');
  const list = document.getElementById('links-list');
  list.innerHTML = '';
  links.forEach((url,i)=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = "Scan Link " + (i+1);
    a.target = "_blank";
    a.addEventListener('click', async ()=> {
      const r = await api('/api/scan', 'POST', {username: currentUser});
      if(r.ok){
        showReward(r.reward);
        refresh();
      }
    });
    li.appendChild(a);
    list.appendChild(li);
  });
  container.classList.remove('hidden');
}

async function doImposter(){
  if(!currentUser) return alert('register first');
  const r = await api('/api/find-imposter', 'POST', {username: currentUser});
  if(r.ok){
    showReward(r.reward);
    refresh();
  }
}

async function gameResult(pos){
  if(!currentUser) return alert('register first');
  const r = await api('/api/game-result', 'POST', {username: currentUser, position: pos});
  if(r.ok){
    showReward(r.reward);
    refresh();
  } else {
    alert(r.error || 'error');
  }
}

function showReward(text){
  const el = document.getElementById('reward-banner');
  if(text){
    el.textContent = text;
    el.classList.remove('hidden');
    setTimeout(()=>el.classList.add('hidden'), 5000);
  }
}

async function refresh(){
  const lb = await api('/api/leaderboard');
  const lbEl = document.getElementById('leaderboard');
  lbEl.innerHTML = '';
  if(lb.ok){
    lb.leaderboard.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `[Team ${p.team}] ${p.username} — ${p.points} pts (scans:${p.scans} wins:${p.wins} imp:${p.found_imposter})`;
      lbEl.appendChild(li);
    });
  }
  if(currentUser){
    const me = (lb.ok && lb.leaderboard.find(x=>x.username===currentUser)) || null;
    document.getElementById('player-stats').textContent = me ? JSON.stringify(me, null, 2) : 'No data yet';
  }

  // refresh teams + players
  if(lb.ok){
    renderTeams(lb.leaderboard);
    renderPlayerSelect(lb.leaderboard);
  }
}

// ================= ADMIN FUNCTIONS =================

// Add Player (Admin)
document.getElementById("btn-add-player").addEventListener("click", async () => {
  const name = document.getElementById("new-username").value.trim();
  const team = document.getElementById("new-team").value.trim(); // match HTML id

  if (!name || !team) {
    alert("Please enter both player name and team");
    return;
  }

  const res = await api("/api/admin/add-player", "POST", { username: name, team: team });
  if (res.ok) {
    alert(res.msg || "Player added");
    document.getElementById("new-username").value = "";
    document.getElementById("new-team").value = "";
    refresh(); // reload everything
  } else {
    alert("Error: " + res.error);
  }
});

async function setImposter(){
  const teamId = document.getElementById('team-imposter-select').value;
  const player = document.getElementById('player-select').value;
  if(!teamId || !player) return alert('select team and player');
  const r = await api('/api/admin/set-imposter', 'POST', {team: teamId, username: player});
  if(r.ok){
    alert(r.msg);
    refresh();
  } else {
    alert(r.error || 'error');
  }
}

function renderTeams(players){
  const container = document.getElementById('teams-container');
  container.innerHTML = '';
  for(let t=1;t<=12;t++){
    const div = document.createElement('div');
    div.className = "border rounded-lg p-3 bg-slate-50 shadow";
    const title = document.createElement('h3');
    title.className = "font-semibold text-slate-800 mb-2";
    title.textContent = `Team ${t}`;
    div.appendChild(title);
    const ul = document.createElement('ul');
    players.filter(p=>p.team==t).forEach(p=>{
      const li = document.createElement('li');
      li.textContent = `${p.username} (${p.points} pts)`;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    container.appendChild(div);
  }
}

function renderPlayerSelect(players){
  const select = document.getElementById('player-select');
  const teamSelect = document.getElementById('team-imposter-select');
  select.innerHTML = '';
  teamSelect.innerHTML = '';

  for(let t=1;t<=12;t++){
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = "Team " + t;
    teamSelect.appendChild(opt);
  }

  players.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.username;
    opt.textContent = `${p.username} (Team ${p.team})`;
    select.appendChild(opt);
  });
}

// ================= EVENT BINDINGS =================
window.addEventListener('load', ()=>{
  document.getElementById('btn-register').addEventListener('click', doRegister);
  document.getElementById('btn-scan').addEventListener('click', doScan);
  document.getElementById('btn-imposter').addEventListener('click', doImposter);
  document.getElementById('btn-winner').addEventListener('click', ()=>gameResult('winner'));
  document.getElementById('btn-run').addEventListener('click', ()=>gameResult('runner'));
  document.getElementById('btn-set-imposter').addEventListener('click', setImposter);

  refresh();
});







