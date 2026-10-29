import { supabase } from "./supabase.js";

const SITE_URL = "https://ledyamanager-cloud.github.io/nexus-360/";

document.addEventListener("DOMContentLoaded", () => {
  const loginTop = document.getElementById("loginTop");
  const loginTopLabel = document.getElementById("loginTopLabel");
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");

  let currentUser = null;

  function showMessage(message, isError = false) {
    let box = document.getElementById("nexusAuthMessage");

    if (!box) {
      box = document.createElement("div");
      box.id = "nexusAuthMessage";
      box.style.cssText =
        "margin-top:12px;padding:12px;border-radius:8px;white-space:pre-wrap;";
      const modal = document.querySelector(
        '[role="dialog"], .modal-content, .modal, #authModal'
      );
      (modal || document.body).appendChild(box);
    }

    box.textContent = message;
    box.style.background = isError ? "#ffe5e5" : "#e5ffe9";
    box.style.color = isError ? "#a00000" : "#075b20";
  }

  function getAuthFields() {
    const emailInput = document.querySelector(
      'input[type="email"], input[name="email"], #email'
    );
    const passwordInput = document.querySelector(
      'input[type="password"], input[name="password"], #password'
    );
    const nameInput = document.querySelector(
      'input[name="name"], input[name="full_name"], #name, #fullName'
    );

    return {
      email: emailInput?.value.trim() || "",
      password: passwordInput?.value || "",
      fullName: nameInput?.value.trim() || ""
    };
  }

  async function register() {
    const { email, password, fullName } = getAuthFields();

    if (!email || !password) {
      showMessage("Entre ton adresse e-mail et ton mot de passe.", true);
      return;
    }

    if (password.length < 6) {
      showMessage("Le mot de passe doit contenir au moins 6 caractères.", true);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: SITE_URL
      }
    });

    if (error) {
      showMessage("Erreur d'inscription : " + error.message, true);
      return;
    }

    if (data.session) {
      showMessage("Ton compte est créé et tu es connecté !");
    } else {
      showMessage(
        "Compte créé ! Vérifie ta boîte e-mail pour confirmer ton inscription."
      );
    }
  }

  async function login() {
    const { email, password } = getAuthFields();

    if (!email || !password) {
      showMessage("Entre ton adresse e-mail et ton mot de passe.", true);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage("Erreur de connexion : " + error.message, true);
      return;
    }

    currentUser = data.user;
    updateAccountDisplay(currentUser);
    showMessage("Connexion réussie !");
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showMessage("Erreur de déconnexion : " + error.message, true);
      return;
    }

    currentUser = null;
    updateAccountDisplay(null);
    showMessage("Tu es déconnecté.");
  }

  function updateAccountDisplay(user) {
    if (loginTopLabel) {
      loginTopLabel.textContent = user
        ? user.user_metadata?.full_name || user.email
        : "Connexion";
    } else if (loginTop) {
      loginTop.textContent = user
        ? user.user_metadata?.full_name || user.email
        : "Connexion";
    }

    if (loginTop) {
      loginTop.title = user ? "Appuie pour te déconnecter" : "Connexion";
    }
  }

  if (registerButton) {
    registerButton.addEventListener("click", (event) => {
      event.preventDefault();
      register().catch((error) =>
        showMessage("Erreur : " + error.message, true)
      );
    });
  }

  if (loginButton) {
    loginButton.addEventListener("click", (event) => {
      event.preventDefault();
      login().catch((error) =>
        showMessage("Erreur : " + error.message, true)
      );
    });
  }

  if (loginTop) {
    loginTop.addEventListener("click", async (event) => {
      if (currentUser) {
        event.preventDefault();
        await logout();
      }
    });
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    updateAccountDisplay(currentUser);
  });

  supabase.auth.getSession().then(({ data }) => {
    currentUser = data.session?.user || null;
    updateAccountDisplay(currentUser);
  });
});
