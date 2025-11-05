const users = [
  { username: "admin", password: "1234", isStaff: true },
  { username: "dev", password: "rfrp", isStaff: true }
];

let status = {
  server: "Offline",
  bot: "Offline",
  app: "Offline"
};

// --- login logic ---
const form = document.getElementById("loginForm");
const panel = document.getElementById("panel");

if (form) {
  // controlla se l'utente è già loggato
  const loggedIn = localStorage.getItem("loggedUser");
  if (loggedIn) {
    form.classList.add("hidden");
    panel.classList.remove("hidden");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const msg = document.getElementById("login-msg");
    const found = users.find(x => x.username === u && x.password === p);

    if (found) {
      localStorage.setItem("loggedUser", u);
      msg.textContent = "";
      form.classList.add("hidden");
      panel.classList.remove("hidden");
    } else {
      msg.textContent = "Credenziali errate.";
    }
  });
}

// --- logout ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    location.reload();
  });
}

// --- salvataggio stato ---
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    status.server = document.getElementById("serverSelect").value;
    status.bot = document.getElementById("botSelect").value;
    status.app = document.getElementById("appSelect").value;
    localStorage.setItem("rfrpStatus", JSON.stringify(status));
    alert("✅ Stato aggiornato con successo!");
  });
}

// --- mostra stato su status.html ---
const serverStatus = document.getElementById("serverStatus");
if (serverStatus) {
  const saved = JSON.parse(localStorage.getItem("rfrpStatus"));
  if (saved) {
    document.getElementById("serverStatus").textContent = saved.server;
    document.getElementById("botStatus").textContent = saved.bot;
    document.getElementById("appStatus").textContent = saved.app;
  }
}
