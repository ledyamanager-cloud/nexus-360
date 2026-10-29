import { supabase } from "./supabase.js";

const SITE_URL = "https://ledyamanager-cloud.github.io/nexus-360/";

function createAuthModal() {
let modal = document.getElementById("nexusAuthModal");
if (modal) return modal;

modal = document.createElement("div");
modal.id = "nexusAuthModal";
modal.style.cssText = "position:fixed;inset:0;z-index:99999; background:rgba(0,0,0,.7);display:none; align-items:center;justify-content:center;padding:16px;";

modal.innerHTML = `
<div style="background:white;width:100%;max-width:400px;
padding:24px;border-radius:16px;position:relative;
font-family:Arial,sans-serif;color:#13213b">
<button id="nexusCloseAuth" aria-label="Fermer"
style="position:absolute;right:14px;top:12px;border:0;
background:none;font-size:25px;cursor:pointer">×</button>

  <h2 style="margin:0 0 8px;color:#0759dc">NEXUS 360</h2>
  <p id="nexusAuthSubtitle" style="color:#718096">
    Connecte-toi à ton compte
  </p>

  <form id="nexusAuthForm">
    <label for="nexusFullName" id="nexusNameLabel"
      style="display:none">Nom complet</label>
    <input id="nexusFullName" type="text"
      placeholder="Nom complet"
      autocomplete="name"
      style="display:none;width:100%;padding:12px;margin:7px 0;
      border:1px solid #ddd;border-radius:8px">

    <label for="nexusEmail">Adresse e-mail</label>
    <input id="nexusEmail" type="email" required
      autocomplete="email" placeholder="nom@exemple.com"
      style="width:100%;padding:12px;margin:7px 0 14px;
      border:1px solid #ddd;border-radius:8px">

    <label for="nexusPassword">Mot de passe</label>
    <input id="nexusPassword" type="password" required
      minlength="6" autocomplete="current-password"
      placeholder="Au moins 6 caractères"
      style="width:100%;padding:12px;margin:7px 0 14px;
      border:1px solid #ddd;border-radius:8px">

    <button id="nexusSubmitAuth" type="submit"
      style="width:100%;padding:13px;border:0;border-radius:8px;
      background:#0759dc;color:white;font-weight:bold">
      Se connecter
    </button>
  </form>

  <button id="nexusForgotPassword" type="button"
    style="border:0;background:none;color:#0759dc;
    margin-top:12px;cursor:pointer">
    Mot de passe oublié ?
  </button>

  <p id="nexusAuthMessage" role="status"
    style="white-space:pre-wrap;line-height:1.5"></p>
</div>

`;

document.body.appendChild(modal);

modal.querySelector("#nexusCloseAuth").onclick = () => {
modal.style.display = "none";
};

modal.addEventListener("click", (event) => {
if (event.target === modal) modal.style.display = "none";
});

return modal;
}

document.addEventListener("DOMContentLoaded", async () => {
const modal = createAuthModal();
const form = modal.querySelector("#nexusAuthForm");
const nameInput = modal.querySelector("#nexusFullName");
const nameLabel = modal.querySelector("#nexusNameLabel");
const emailInput = modal.querySelector("#nexusEmail");
const passwordInput = modal.querySelector("#nexusPassword");
const submitButton = modal.querySelector("#nexusSubmitAuth");
const message = modal.querySelector("#nexusAuthMessage");
const subtitle = modal.querySelector("#nexusAuthSubtitle");
const forgotButton = modal.querySelector("#nexusForgotPassword");

let mode = "login";
let currentUser = null;

function showMessage(text, error = false) {
message.textContent = text;
message.style.color = error ? "#b00020" : "#08752b";
}

function setMode(newMode) {
mode = newMode;
const registering = mode === "register";
nameInput.style.display = registering ? "block" : "none";
nameLabel.style.display = registering ? "block" : "none";
nameInput.required = registering;
passwordInput.autocomplete = registering
? "new-password"
: "current-password";

subtitle.textContent = registering
  ? "Crée ton compte NEXUS 360"
  : "Connecte-toi à ton compte";

submitButton.textContent = registering
  ? "Créer mon compte"
  : "Se connecter";

forgotButton.style.display = registering ? "none" : "inline-block";
showMessage("");

}

function openAuth(newMode = "login") {
setMode(newMode);
modal.style.display = "flex";
}

window.nexusOpenAuth = openAuth;

function updateAccountDisplay(user) {
const label = document.getElementById("loginTopLabel");
const greeting = document.getElementById("accountGreeting");
const subtext = document.getElementById("accountSubtext");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

if (label) {
  label.textContent = user
    ? (user.user_metadata?.full_name || user.email || "Mon compte")
    : "Se connecter";
}

if (greeting) {
  greeting.textContent = user
    ? `Bonjour, ${user.user_metadata?.full_name || ""}`.trim()
    : "Bonjour,";
}

if (subtext) {
  subtext.textContent = user
    ? (user.email || "Compte connecté")
    : "Connecte-toi pour une meilleure expérience";
}

if (loginButton) {
  loginButton.textContent = user ? "Se déconnecter" : "Se connecter";
}

if (registerButton) {
  registerButton.style.display = user ? "none" : "block";
}

}

async function logout() {
const { error } = await supabase.auth.signOut();
if (error) {
openAuth("login");
showMessage("Erreur de déconnexion : " + error.message, true);
return;
}
currentUser = null;
updateAccountDisplay(null);
showMessage("Tu es déconnecté.");
}

document.getElementById("loginTop")?.addEventListener("click", () => {
if (currentUser) {
logout();
} else {
openAuth("login");
}
});

document.getElementById("loginButton")?.addEventListener("click", () => {
if (currentUser) {
logout();
} else {
openAuth("login");
}
});

document.getElementById("registerButton")?.addEventListener("click", () => {
openAuth("register");
});

document.getElementById("sellerButton")?.addEventListener("click", () => {
openAuth("register");
});

form.addEventListener("submit", async (event) => {
event.preventDefault();
submitButton.disabled = true;
showMessage("Patiente un instant…");

try {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (mode === "register") {
    const fullName = nameInput.value.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: SITE_URL
      }
    });

    if (error) throw error;

    if (data.session) {
      currentUser = data.user;
      updateAccountDisplay(currentUser);
      showMessage("Compte créé avec succès !");
      setTimeout(() => { modal.style.display = "none"; }, 1200);
    } else {
      showMessage(
        "Compte créé ! Vérifie ta boîte e-mail pour confirmer ton inscription."
      );
    }
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user;
    updateAccountDisplay(currentUser);
    showMessage("Connexion réussie !");
    setTimeout(() => { modal.style.display = "none"; }, 1000);
  }
} catch (error) {
  showMessage("Erreur : " + error.message, true);
} finally {
  submitButton.disabled = false;
}

});

forgotButton.addEventListener("click", async () => {
const email = emailInput.value.trim();

if (!email) {
  showMessage("Entre ton adresse e-mail d'abord.", true);
  return;
}

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: SITE_URL
});

if (error) {
  showMessage("Erreur : " + error.message, true);
} else {
  showMessage("Si cette adresse est enregistrée, un e-mail de réinitialisation sera envoyé.");
}

});

const { data, error } = await supabase.auth.getSession();

if (error) {
showMessage("Impossible de vérifier la session : " + error.message, true);
} else {
currentUser = data.session?.user || null;
updateAccountDisplay(currentUser);
}

supabase.auth.onAuthStateChange((_event, session) => {
currentUser = session?.user || null;
updateAccountDisplay(currentUser);
});

setMode("login");
});
