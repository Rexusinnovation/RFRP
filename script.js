// utenti hardcoded (per test)
const users = [
  { username: "admin", password: "1234", isStaff: true },
  { username: "dev", password: "rfrp", isStaff: true }
];

let status = {
  server: "Offline",
  bot: "Offline",
  app: "Offline"
};

// login staff
const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const found = users.find(x => x.username === u && x.password === p);

    const msg = document.getElementById("login-msg");
    if (found) {
      msg.textContent = `Benvenuto ${found.username}`;
      document.getElementById("panel").classList.remove("hidden");
      form.classList.add("hidden");
    } else {
      msg.textContent = "Credenziali errate.";
    }
  });
}

// salva stato
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    status.server = document.getElementById("serverSelect").value;
    status.bot = document.getElementById("botSelect").value;
    status.app = document.getElementById("appSelect").value;
    localStorage.setItem("rfrpStatus", JSON.stringify(status));
    alert("Stato aggiornato!");
  });
}

// mostra stato su status.html
const serverStatus = document.getElementById("serverStatus");
if (serverStatus) {
  const saved = JSON.parse(localStorage.getItem("rfrpStatus"));
  if (saved) {
    document.getElementById("serverStatus").textContent = saved.server;
    document.getElementById("botStatus").textContent = saved.bot;
    document.getElementById("appStatus").textContent = saved.app;
  }
}
