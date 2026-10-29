import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4kaTteTE4A68vjBPtWf5yj_0EV_ew8A",
  authDomain: "nexus-360-30fb7.firebaseapp.com",
  projectId: "nexus-360-30fb7",
  storageBucket: "nexus-360-30fb7.firebasestorage.app",
  messagingSenderId: "822196764774",
  appId: "1:822196764774:web:752ddb118b6f9d8232eda7",
  measurementId: "G-RQ9Z9C8LSW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ==================================================
// NEXUS 360 — AUTHENTIFICATION
// ==================================================

const styles = document.createElement("style");

styles.textContent = `
  .nexus-auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    background: rgba(3, 12, 30, .82);
    backdrop-filter: blur(6px);
  }

  .nexus-auth-box {
    position: relative;
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 28px;
    border-radius: 18px;
    background: #fff;
    color: #172033;
    font-family: Arial, sans-serif;
    box-shadow: 0 20px 60px rgba(0,0,0,.3);
  }

  .nexus-auth-box h2 {
    margin: 0 0 8px;
    color: #10254a;
    font-size: 25px;
  }

  .nexus-auth-subtitle {
    margin: 0 0 22px;
    color: #687386;
    font-size: 14px;
    line-height: 1.5;
  }

  .nexus-auth-close {
    position: absolute;
    top: 12px;
    right: 14px;
    border: 0;
    background: transparent;
    font-size: 27px;
    cursor: pointer;
    color: #64748b;
  }

  .nexus-auth-box label {
    display: block;
    margin: 13px 0 6px;
    font-size: 13px;
    font-weight: 700;
  }

  .nexus-auth-box input {
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    border: 1px solid #d8deea;
    border-radius: 9px;
    font-size: 15px;
    outline: none;
  }

  .nexus-auth-box input:focus {
    border-color: #2455a4;
    box-shadow: 0 0 0 3px rgba(36,85,164,.1);
  }

  .nexus-auth-primary {
    width: 100%;
    margin-top: 20px;
    padding: 13px;
    border: 0;
    border-radius: 9px;
    background: #102c59;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  .nexus-auth-primary:disabled {
    opacity: .6;
    cursor: wait;
  }

  .nexus-auth-secondary {
    display: block;
    margin: 15px auto 0;
    border: 0;
    background: transparent;
    color: #2455a4;
    cursor: pointer;
    font-size: 14px;
  }

  .nexus-auth-message {
    margin-top: 14px;
    padding: 10px;
    border-radius: 8px;
    background: #f1f5f9;
    font-size: 13px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .nexus-auth-message:empty {
    display: none;
  }

  .nexus-auth-message.error {
    background: #fff0f0;
    color: #a32020;
  }

  .nexus-auth-message.success {
    background: #eaf9ef;
    color: #176534;
  }
`;

document.head.appendChild(styles);

let authOverlay = null;
let authMode = "login";

function firebaseErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use":
      "Cette adresse e-mail possède déjà un compte.",
    "auth/invalid-email":
      "L'adresse e-mail n'est pas valide.",
    "auth/weak-password":
      "Choisis un mot de passe plus robuste.",
    "auth/invalid-credential":
      "Adresse e-mail ou mot de passe incorrect.",
    "auth/user-not-found":
      "Aucun compte ne correspond à cette adresse.",
    "auth/wrong-password":
      "Mot de passe incorrect.",
    "auth/too-many-requests":
      "Trop de tentatives. Réessaie plus tard.",
    "auth/network-request-failed":
      "Problème de connexion Internet. Vérifie ton réseau.",
    "auth/unauthorized-domain":
      "Ce domaine n'est pas autorisé dans Firebase Authentication."
  };
console.error("Erreur Firebase NEXUS 360 :", error);

return messages[error.code] ||
    `Erreur Firebase : ${error.code || error.message}`;

function showAuthMessage(message, type = "") {
  const box = document.getElementById("nexusAuthMessage");

  if (!box) return;

  box.textContent = message;
  box.className = "nexus-auth-message " + type;
}

function closeAuthModal() {
  if (authOverlay) {
    authOverlay.remove();
    authOverlay = null;
  }
}

function openAuthModal(mode = "login") {
  authMode = mode;
  closeAuthModal();

  authOverlay = document.createElement("div");
  authOverlay.className = "nexus-auth-overlay";

  renderAuthModal();

  document.body.appendChild(authOverlay);

  authOverlay.addEventListener("click", event => {
    if (event.target === authOverlay) {
      closeAuthModal();
    }
  });

  authOverlay.querySelector(".nexus-auth-close")
    .addEventListener("click", closeAuthModal);
}

function renderAuthModal() {
  if (!authOverlay) return;

  const isRegister = authMode === "register";
  const isReset = authMode === "reset";

  const title = isRegister
    ? "Créer mon compte"
    : isReset
      ? "Mot de passe oublié"
      : "Bienvenue sur NEXUS 360";

  const subtitle = isRegister
    ? "Inscris-toi pour profiter des services NEXUS 360."
    : isReset
      ? "Saisis ton adresse e-mail pour recevoir un lien de réinitialisation."
      : "Connecte-toi pour accéder à ton espace client.";

  authOverlay.innerHTML = `
    <section class="nexus-auth-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexusAuthTitle">

      <button class="nexus-auth-close"
        type="button"
        aria-label="Fermer">&times;</button>

      <h2 id="nexusAuthTitle">NEXUS 360</h2>

      <p class="nexus-auth-subtitle">
        ${title}<br>${subtitle}
      </p>

      <form id="nexusAuthForm">

        ${
          isRegister
            ? `
              <label for="nexusAuthName">Nom complet</label>
              <input id="nexusAuthName"
                type="text"
                autocomplete="name"
                maxlength="80"
                required>
            `
            : ""
        }

        <label for="nexusAuthEmail">Adresse e-mail</label>
        <input id="nexusAuthEmail"
          type="email"
          autocomplete="email"
          required>

        ${
          isReset
            ? ""
            : `
              <label for="nexusAuthPassword">Mot de passe</label>
              <input id="nexusAuthPassword"
                type="password"
                autocomplete="${isRegister ? "new-password" : "current-password"}"
                minlength="6"
                required>
            `
        }

        <div id="nexusAuthMessage"
          class="nexus-auth-message"
          aria-live="polite"></div>

        <button class="nexus-auth-primary"
          type="submit">
          ${
            isRegister
              ? "Créer mon compte"
              : isReset
                ? "Envoyer le lien"
                : "Se connecter"
          }
        </button>
      </form>

      ${
        isReset
          ? `
            <button class="nexus-auth-secondary"
              id="nexusBackToLogin"
              type="button">
              Retour à la connexion
            </button>
          `
          : isRegister
            ? `
              <button class="nexus-auth-secondary"
                id="nexusSwitchMode"
                type="button">
                Déjà inscrit(e) ? Se connecter
              </button>
            `
            : `
              <button class="nexus-auth-secondary"
                id="nexusForgotPassword"
                type="button">
                Mot de passe oublié ?
              </button>

              <button class="nexus-auth-secondary"
                id="nexusSwitchMode"
                type="button">
                Pas encore de compte ? S'inscrire
              </button>
            `
      }
    </section>
  `;

  authOverlay.querySelector("#nexusAuthForm")
    .addEventListener("submit", handleAuthSubmit);

  const switchButton =
    authOverlay.querySelector("#nexusSwitchMode");

  if (switchButton) {
    switchButton.addEventListener("click", () => {
      authMode = isRegister ? "login" : "register";
      renderAuthModal();
    });
  }

  const forgotButton =
    authOverlay.querySelector("#nexusForgotPassword");

  if (forgotButton) {
    forgotButton.addEventListener("click", () => {
      authMode = "reset";
      renderAuthModal();
    });
  }

  const backButton =
    authOverlay.querySelector("#nexusBackToLogin");

  if (backButton) {
    backButton.addEventListener("click", () => {
      authMode = "login";
      renderAuthModal();
    });
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  const email = document
    .getElementById("nexusAuthEmail")
    .value.trim();

  const passwordInput = document.getElementById(
    "nexusAuthPassword"
  );

  const password = passwordInput
    ? passwordInput.value
    : "";

  const nameInput = document.getElementById("nexusAuthName");

  const displayName = nameInput
    ? nameInput.value.trim()
    : "";

  submitButton.disabled = true;
  showAuthMessage("Patiente un instant…");

  try {
    if (authMode === "register") {
      if (displayName.length < 2) {
        throw new Error("NAME_REQUIRED");
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: displayName
      });

      showAuthMessage(
        "Ton compte a été créé avec succès !",
        "success"
      );

      updateAccountDisplay(result.user);

      setTimeout(closeAuthModal, 900);

    } else if (authMode === "login") {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      showAuthMessage(
        "Connexion réussie ! Bienvenue sur NEXUS 360.",
        "success"
      );

      updateAccountDisplay(result.user);

      setTimeout(closeAuthModal, 700);

    } else if (authMode === "reset") {
      await sendPasswordResetEmail(auth, email);

      showAuthMessage(
        "Si cette adresse est associée à un compte, un e-mail de réinitialisation sera envoyé.",
        "success"
      );
    }

  } catch (error) {
    if (error.message === "NAME_REQUIRED") {
      showAuthMessage(
        "Saisis ton nom complet (au moins 2 caractères).",
        "error"
      );
    } else {
      showAuthMessage(
        firebaseErrorMessage(error),
        "error"
      );
    }

  } finally {
    if (submitButton.isConnected) {
      submitButton.disabled = false;
    }
  }
}

// ==================================================
// MISE À JOUR DE L'INTERFACE
// ==================================================

function updateAccountDisplay(user) {
  const loginTop = document.getElementById("loginTop");
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");

  if (user) {
    const name = user.displayName ||
      (user.email ? user.email.split("@")[0] : "Client");

    if (loginTop) {
      loginTop.textContent = name;
      loginTop.setAttribute("aria-label", "Compte connecté");
    }

    if (loginButton) {
      loginButton.textContent = "Mon compte";
    }

    if (registerButton) {
      registerButton.textContent = "Déconnexion";
    }

  } else {
    if (loginTop) {
      loginTop.textContent = "Connexion";
    }

    if (loginButton) {
      loginButton.textContent = "Se connecter";
    }

    if (registerButton) {
      registerButton.textContent = "Créer un compte";
    }
  }
}

onAuthStateChanged(auth, user => {
  updateAccountDisplay(user);
});

// ==================================================
// BRANCHEMENT DES BOUTONS DE LA PAGE
// ==================================================

function connectAccountButtons() {
  const loginTop = document.getElementById("loginTop");
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");

  if (loginTop && !loginTop.dataset.firebaseBound) {
    loginTop.dataset.firebaseBound = "true";

    loginTop.addEventListener("click", () => {
      if (auth.currentUser) {
        alert(
          "Tu es connecté avec : " +
          auth.currentUser.email
        );
      } else {
        openAuthModal("login");
      }
    });
  }

  if (loginButton && !loginButton.dataset.firebaseBound) {
    loginButton.dataset.firebaseBound = "true";

    loginButton.addEventListener("click", () => {
      if (auth.currentUser) {
        alert(
          "Compte connecté : " +
          auth.currentUser.email
        );
      } else {
        openAuthModal("login");
      }
    });
  }

  if (registerButton && !registerButton.dataset.firebaseBound) {
    registerButton.dataset.firebaseBound = "true";

    registerButton.addEventListener("click", async () => {
      if (auth.currentUser) {
        const confirmed = confirm(
          "Veux-tu vraiment te déconnecter ?"
        );

        if (!confirmed) return;

        try {
          await signOut(auth);
          alert("Tu es maintenant déconnecté(e).");
        } catch (error) {
          alert(firebaseErrorMessage(error));
        }

      } else {
        openAuthModal("register");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    connectAccountButtons
  );
} else {
  connectAccountButtons();
}

console.log("NEXUS 360 : Firebase est initialisé.");
