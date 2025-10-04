from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ------------------------------
# Mock Database (In-memory)
# ------------------------------
players = []  # [{username, team, score, imposter, role}]
teams = [[] for _ in range(12)]  # 12 teams

ADMINS = {
    "1": {"name": "Arsh", "password": "Arsh123"},
    "2": {"name": "Rishab", "password": "Rishab123"},
    "3": {"name": "Sama", "password": "Sama123"},
    "4": {"name": "Firdaus", "password": "Firdaus123"},
    "5": {"name": "Rashmi", "password": "Rashmi123"},
    "6": {"name": "MuhammadMaaz", "password": "Maaz123"},
    "7": {"name": "Naveli", "password": "Naveli123"},
    "8": {"name": "Girish", "password": "Girish123"},
    "9": {"name": "Mahesh", "password": "Mahesh123"},
    "10": {"name": "Laxman", "password": "Laxman123"},
    "11": {"name": "Namrata", "password": "Namrata123"},
    "12": {"name": "Arshan", "password": "Arshan123"},
}

# ------------------------------
# Routes for Pages
# ------------------------------
@app.route("/")
def home():
    # Pass ADMINS to template so login.js can use it
    return render_template("index.html", ADMINS=ADMINS)

@app.route("/player")
def player_dashboard():
    return render_template("player_dashboard.html")

@app.route("/admin")
def admin_dashboard():
    return render_template("admin_dashboard.html", ADMINS=ADMINS)

# ------------------------------
# API Endpoints - Player Register/Login
# ------------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    team = str(data.get("team"))

    if not username or not team:
        return jsonify(ok=False, error="Username and ambassador selection required"), 400

    existing = next((p for p in players if p["username"] == username), None)
    if existing:
        # allow re-login
        return jsonify(ok=True, msg="Welcome back", username=existing["username"], team=existing["team"])

    if team not in ADMINS:
        return jsonify(ok=False, error="Invalid team"), 400

    player = {
        "username": username,
        "team": team,
        "score": 0,
        "imposter": False,
        "role": None
    }
    players.append(player)
    teams[int(team)-1].append(player)

    return jsonify(ok=True, msg=f"{username} registered in Team {team}", username=username, team=team)

# ------------------------------
# API Endpoints - Player Data
# ------------------------------
@app.route("/api/players")
def get_players():
    return jsonify({"players": players})

@app.route("/api/player/score", methods=["POST"])
def update_score():
    """Increase player's score when clicking a link"""
    data = request.json
    username = data.get("username")
    points = int(data.get("points", 0))

    for p in players:
        if p["username"] == username:
            p["score"] += points
            return jsonify(ok=True, msg=f"{username} gained {points} points!", score=p["score"])

    return jsonify(ok=False, error="Player not found"), 404

# ------------------------------
# API Endpoints - Admin Login
# ------------------------------
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.json
    name, team, password = data.get("name"), str(data.get("team")), data.get("password")

    if team not in ADMINS:
        return jsonify(ok=False, error="Invalid team"), 400
    if ADMINS[team]["name"] != name:
        return jsonify(ok=False, error="Ambassador mismatch"), 400
    if ADMINS[team]["password"] != password:
        return jsonify(ok=False, error="Wrong password"), 400

    return jsonify(ok=True, msg=f"Welcome {name}", team=team)

# ------------------------------
# API Endpoints - Admin Actions
# ------------------------------
@app.route("/api/admin/set_imposter", methods=["POST"])
def set_imposter():
    data = request.json
    username = data.get("username")
    if not username:
        return jsonify(ok=False, error="Username required"), 400
    for p in players:
        if p["username"] == username:
            p["imposter"] = True
            return jsonify(ok=True, msg=f"{username} set as Imposter")
    return jsonify(ok=False, error="Player not found"), 404

@app.route("/api/admin/announce", methods=["POST"])
def announce_results():
    data = request.json
    username = data.get("username")
    role = data.get("role")  # winner / runner
    for p in players:
        if p["username"] == username:
            p["role"] = role
            if role == "winner":
                p["score"] += 50
            elif role == "runner":
                p["score"] += 30
            return jsonify(ok=True, msg=f"{username} set as {role}")
    return jsonify(ok=False, error="Player not found"), 404

@app.route("/api/teams")
def get_teams():
    return jsonify({"teams": teams})

@app.route("/api/admin/reset", methods=["POST"])
def reset_game():
    global players, teams
    players = []
    teams = [[] for _ in range(12)]
    return jsonify(ok=True, msg="Game reset successful!")

# ------------------------------
# Dummy Links for Players
# ------------------------------
@app.route("/api/links")
def get_links():
    """Return dummy links (replace later with real links)"""
    return jsonify({
        "links": [
            {"title": "Resource 1", "url": "#", "points": 5},
            {"title": "Resource 2", "url": "#", "points": 5},
            {"title": "Resource 3", "url": "#", "points": 5}
        ]
    })

# ------------------------------
# Run App
# ------------------------------
if __name__ == "__main__":
    app.run(debug=True)
