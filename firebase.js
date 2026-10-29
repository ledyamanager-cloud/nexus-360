import { supabase } from "./supabase.js";

const SITE_URL = "https://ledyamanager-cloud.github.io/nexus-360/";

/* =====================================
   CRÉATION DE LA FENÊTRE D'AUTHENTIFICATION
===================================== */

function createAuthModal() {
  let modal = document.getElementById("nexusAuthModal");

  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "nexusAuthModal";

  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: rgba(0, 0, 0, 0.75);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      width: 100%;
      max-width: 400px;
      padding: 24px;
      border-radius: 16px;
      position: relative;
      font-family: Arial, sans-serif;
      color: #13213b;
      box-shadow: 0 15px 50px rgba(0,0,0,.3);
      max-height: 95vh;
      overflow-y: auto;
    ">

      <button
        id="nexusCloseAuth"
        type="button"
        aria-label="Fermer"
        style="
          position: absolute;
          right: 14px;
          top: 10px;
          border: 0;
          background: none;
          font-size: 28px;
          cursor: pointer;
        "
      >×</button>

      <h2 style="margin: 0 0 8px; color: #0759dc;">
        NEXUS 360
      </h2>

      <p id="nexusAuthSubtitle" style="color: #718096;">
        Connecte-toi à ton compte
      </p>

      <form id="nexusAuthForm">

        <div id="nexusNameGroup" style="display: none; margin-bottom: 12px;">
          <label for="nexusFullName">Nom complet</label>

          <input
            id="nexusFullName"
            type="text"
            placeholder="Ton nom complet"
            autocomplete="name"
            style="
              display: block;
              width: 100%;
              padding: 12px;
              margin-top: 7px;
              border: 1px solid #ddd;
              border-radius: 8px;
            "
          >
        </div>

        <div style="margin-bottom: 12px;">
          <label for="nexusEmail">Adresse e-mail</label>

          <input
            id="nexusEmail"
            type="email"
            required
            autocomplete="email"
            placeholder="nom@exemple.com"
            style="
              display: block;
              width: 100%;
              padding: 12px;
              margin-top: 7px;
              border: 1px solid #ddd;
              border-radius: 8px;
            "
          >
        </div>

        <div style="margin-bottom: 12px;">
          <label for="nexusPassword">Mot de passe</label>

          <input
            id="nexusPassword"
            type="password"
            required
            minlength="6"
            autocomplete="current-password"
            placeholder="Au moins 6 caractères"
            style="
              display: block;
              width: 100%;
              padding: 12px;
              margin-top: 7px;
              border: 1px solid #ddd;
              border-radius: 8px;
            "
          >
        </div>

        <button
          id="nexusSubmitAuth"
          type="submit"
          style="
            width: 100%;
            padding: 13px;
            border: 0;
            border-radius: 8px;
            background: #0759dc;
            color: white;
            font-weight: bold;
            cursor: pointer;
          "
        >
          Se connecter
        </button>

      </form>

      <button
        id="nexusForgotPassword"
        type="button"
        style="
          border: 0;
          background: none;
          color: #0759dc;
          margin-top: 12px;
          cursor: pointer;
        "
      >
        Mot de passe oublié ?
      </button>

      <p
        id="nexusAuthMessage"
        role="status"
        aria-live="polite"
        style="white-space: pre-wrap; line-height: 1.5;"
      ></p>

      <button
        id="nexusSwitchMode"
        type="button"
        style="
          width: 100%;
          padding: 10px;
          border: 1px solid #0759dc;
          border-radius: 8px;
          background: white;
          color: #0759dc;
          margin-top: 8px;
          cursor: pointer;
        "
      >
        Créer un compte
      </button>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#nexusCloseAuth").addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  return modal;
}

/* =====================================
   INITIALISATION
===================================== */

async function initNexusAuth() {
  if (window.nexusAuthInitialized) return;
  window.nexusAuthInitialized = true;

  const modal = createAuthModal();

  const form = modal.querySelector("#nexusAuthForm");
  const nameGroup = modal.querySelector("#nexusNameGroup");
  const nameInput = modal.querySelector("#nexusFullName");
  const emailInput = modal.querySelector("#nexusEmail");
  const passwordInput = modal.querySelector("#nexusPassword");
  const submitButton = modal.querySelector("#nexusSubmitAuth");
  const message = modal.querySelector("#nexusAuthMessage");
  const subtitle = modal.querySelector("#nexusAuthSubtitle");
  const forgotButton = modal.querySelector("#nexusForgotPassword");
  const switchButton = modal.querySelector("#nexusSwitchMode");

  let mode = "login";
  let currentUser = null;

  function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b00020" : "#08752b";
  }

  function setMode(newMode) {
    mode = newMode;

    const registering = mode === "register";

    nameGroup.style.display = registering ? "block" : "none";
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

    forgotButton.style.display = registering
      ? "none"
      : "inline-block";

    switchButton.textContent = registering
      ? "J'ai déjà un compte : me connecter"
      : "Créer un compte";

    showMessage("");
  }

  function openAuth(newMode = "login") {
    setMode(newMode);
    modal.style.display = "flex";
  }

  function closeAuth() {
    modal.style.display = "none";
  }

  // Permet aux autres boutons du site d'ouvrir la bonne fenêtre.
  window.nexusOpenAuth = openAuth;

  /* =====================================
     AFFICHAGE DU COMPTE
  ===================================== */

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
        ? `Bonjour, ${user.user_metadata?.full_name || user.email || ""}`.trim()
        : "Bonjour,";
    }

    if (subtext) {
      subtext.textContent = user
        ? (user.email || "Compte connecté")
        : "Connecte-toi pour une meilleure expérience";
    }

    if (loginButton) {
      loginButton.textContent = user
        ? "Se déconnecter"
        : "Se connecter";
    }

    if (registerButton) {
      registerButton.style.display = user ? "none" : "block";
    }
  }

  /* =====================================
     CONNEXION ET DÉCONNEXION
  ===================================== */

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showMessage("Erreur de déconnexion : " + error.message, true);
      openAuth("login");
      return;
    }

    currentUser = null;
    updateAccountDisplay(null);
    closeAuth();
    alert("Tu es déconnecté de NEXUS 360.");
  }

  function handleLoginClick() {
    if (currentUser) {
      logout();
    } else {
      openAuth("login");
    }
  }

  document.getElementById("loginTop")?.addEventListener(
    "click",
    handleLoginClick
  );

  document.getElementById("loginButton")?.addEventListener(
    "click",
    handleLoginClick
  );

  document.getElementById("registerButton")?.addEventListener(
    "click",
    () => openAuth("register")
  );

  document.getElementById("sellerButton")?.addEventListener(
    "click",
    () => openAuth("register")
  );

  // Bouton situé dans la fenêtre d'authentification.
  switchButton.addEventListener("click", () => {
    setMode(mode === "login" ? "register" : "login");
  });

  /* =====================================
     INSCRIPTION ET CONNEXION
  ===================================== */

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    showMessage("Patiente un instant…");

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (mode === "register") {
        const fullName = nameInput.value.trim();

        if (!fullName) {
          throw new Error("Entre ton nom complet.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: SITE_URL
          }
        });

        if (error) throw error;

        if (data.session && data.user) {
          currentUser = data.user;
          updateAccountDisplay(currentUser);

          showMessage("Compte créé avec succès !");
          setTimeout(closeAuth, 1200);
        } else {
          showMessage(
            "Inscription enregistrée ! Ouvre ta boîte e-mail et clique sur le lien de confirmation avant de te connecter."
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
        setTimeout(closeAuth, 1000);
      }
    } catch (error) {
      showMessage("Erreur : " + error.message, true);
    } finally {
      submitButton.disabled = false;
    }
  });

  /* =====================================
     MOT DE PASSE OUBLIÉ
  ===================================== */

  forgotButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      showMessage("Entre ton adresse e-mail d'abord.", true);
      emailInput.focus();
      return;
    }

    forgotButton.disabled = true;
    showMessage("Envoi de la demande…");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: SITE_URL
      });

      if (error) throw error;

      showMessage(
        "Si cette adresse est enregistrée, tu recevras un e-mail de réinitialisation."
      );
    } catch (error) {
      showMessage("Erreur : " + error.message, true);
    } finally {
      forgotButton.disabled = false;
    }
  });

  /* =====================================
     RESTAURATION DE LA SESSION
  ===================================== */

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    currentUser = data.session?.user || null;
    updateAccountDisplay(currentUser);
  } catch (error) {
    console.error("Erreur de session Supabase :", error);
    showMessage(
      "Impossible de vérifier la session : " + error.message,
      true
    );
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    updateAccountDisplay(currentUser);
  });

  setMode("login");
}

/* =====================================
   DÉMARRER APRÈS LE CHARGEMENT
===================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNexusAuth, { once: true });
} else {
  initNexusAuth();
    }
