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
# Routes
# ------------------------------
@app.route("/")
def home():
    return render_template("index.html", ADMINS=ADMINS)

@app.route("/player")
def player_dashboard():
    return render_template("player_dashboard.html")

@app.route("/admin")
def admin_dashboard():
    return render_template("admin_dashboard.html")

# ------------------------------
# Player Register/Login
# ------------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    team = str(data.get("team"))

    if not username or not team:
        return jsonify(ok=False, error="Username and ambassador selection required"), 400

    # Avoid duplicates
    existing = next((p for p in players if p["username"] == username), None)
    if existing:
        return jsonify(ok=True, msg="Logged in existing player", username=username, team=team)

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
# Admin Login
# ------------------------------
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.json
    name = data.get("name")
    team = str(data.get("team"))
    password = data.get("password")

    if team not in ADMINS:
        return jsonify(ok=False, error="Invalid team"), 400
    if ADMINS[team]["name"] != name:
        return jsonify(ok=False, error="Ambassador mismatch"), 400
    if ADMINS[team]["password"] != password:
        return jsonify(ok=False, error="Wrong password"), 400

    return jsonify(ok=True, msg=f"Welcome {name}", team=team)

# ------------------------------
# Player Actions
# ------------------------------
@app.route("/api/scan", methods=["POST"])
def scan():
    data = request.json
    username = data.get("username")
    player = next((p for p in players if p["username"] == username), None)
    if not player:
        return jsonify(ok=False, error="Player not found"), 404

    # Return dummy links
    dummy_links = [{"url": f"https://example.com/link{i}", "points":5} for i in range(1,16)]
    return jsonify(ok=True, links=dummy_links, score=player["score"])

@app.route("/api/scan/click", methods=["POST"])
def click_link():
    data = request.json
    username = data.get("username")
    points = int(data.get("points", 5))
    player = next((p for p in players if p["username"] == username), None)
    if not player:
        return jsonify(ok=False, error="Player not found"), 404

    player["score"] += points
    return jsonify(ok=True, score=player["score"])

@app.route("/api/leaderboard")
def leaderboard():
    sorted_players = sorted(players, key=lambda x: x["score"], reverse=True)
    return jsonify(sorted_players)

# ------------------------------
# Admin Actions
# ------------------------------
@app.route("/api/admin/set_imposter", methods=["POST"])
def set_imposter():
    data = request.json
    username = data.get("username")
    player = next((p for p in players if p["username"] == username), None)
    if not player:
        return jsonify(ok=False, error="Player not found"), 404
    player["imposter"] = True
    return jsonify(ok=True, msg=f"{username} set as Imposter")

@app.route("/api/admin/announce", methods=["POST"])
def announce_results():
    data = request.json
    username = data.get("username")
    role = data.get("role")  # winner / runner
    player = next((p for p in players if p["username"] == username), None)
    if not player:
        return jsonify(ok=False, error="Player not found"), 404
    player["role"] = role
    if role=="winner":
        player["score"] += 50
    elif role=="runner":
        player["score"] += 30
    return jsonify(ok=True, msg=f"{username} set as {role}")

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
# Run App
# ------------------------------
if __name__ == "__main__":
    app.run(debug=True)
