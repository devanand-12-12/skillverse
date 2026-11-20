
/* ============================================
   SKILLVERSE - SUPABASE AUTHENTICATION
   Signup, Login, Logout and Profile Sync
   ============================================ */

   document.addEventListener("DOMContentLoaded", async function () {
    "use strict";
  
    const SUPABASE_URL =
      "https://ivkznzdfgyrouffrabeh.supabase.co";
  
    const SUPABASE_KEY =
      "sb_publishable_if5NnBIh4hRmYFLmKZw0dA__06zgNfW";
  
    // Automatically use the current website URL.
    const REDIRECT_URL = window.location.origin;
  
    const profilePage = document.getElementById("profile-page");
  
    if (!profilePage) {
      console.error("SKILLVERSE: Profile page not found.");
      return;
    }
  
    if (document.getElementById("sv-auth-panel")) return;
  
    // CREATE ACCOUNT PANEL
    const panel = document.createElement("section");
    panel.id = "sv-auth-panel";
  
    panel.style.cssText = `
      background: #15162b;
      border: 1px solid #34365c;
      border-radius: 14px;
      padding: 18px;
      margin: 20px 0;
      color: #ffffff;
      font-family: Arial, sans-serif;
    `;
  
    panel.innerHTML = `
      <h2 style="color:#39dcca;margin-bottom:12px;">
        SKILLVERSE Account
      </h2>
  
      <p id="sv-auth-status"
         style="font-size:14px;margin-bottom:14px;color:#d5d7ef;">
        Connecting to account service...
      </p>
  
      <div id="sv-auth-forms">
  
        <label style="display:block;margin:10px 0 5px;">
          Email
        </label>
  
        <input id="sv-auth-email"
               type="email"
               autocomplete="email"
               placeholder="Enter your email"
               style="width:100%;padding:12px;border-radius:8px;
               border:1px solid #555;background:#080916;
               color:white;box-sizing:border-box;">
  
        <label style="display:block;margin:12px 0 5px;">
          Password
        </label>
  
        <input id="sv-auth-password"
               type="password"
               autocomplete="current-password"
               placeholder="Minimum 8 characters"
               style="width:100%;padding:12px;border-radius:8px;
               border:1px solid #555;background:#080916;
               color:white;box-sizing:border-box;">
  
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
  
          <button id="sv-signup" type="button"
                  style="padding:11px 16px;border:0;border-radius:8px;
                  background:#39dcca;color:#080916;font-weight:bold;">
            Create Account
          </button>
  
          <button id="sv-login" type="button"
                  style="padding:11px 16px;border:0;border-radius:8px;
                  background:#9470ff;color:white;font-weight:bold;">
            Login
          </button>
  
          <button id="sv-logout" type="button" hidden
                  style="padding:11px 16px;border:0;border-radius:8px;
                  background:#b94b63;color:white;font-weight:bold;">
            Logout
          </button>
  
        </div>
      </div>
    `;
  
    profilePage.prepend(panel);
  
    const statusText = document.getElementById("sv-auth-status");
    const emailInput = document.getElementById("sv-auth-email");
    const passwordInput = document.getElementById("sv-auth-password");
  
    const signupButton = document.getElementById("sv-signup");
    const loginButton = document.getElementById("sv-login");
    const logoutButton = document.getElementById("sv-logout");
  
    function showStatus(message, color = "#d5d7ef") {
      statusText.textContent = message;
      statusText.style.color = color;
    }
  
    function setAuthButtons(isLoggedIn) {
      signupButton.hidden = isLoggedIn;
      loginButton.hidden = isLoggedIn;
      logoutButton.hidden = !isLoggedIn;
    }
  
    function validateInputs(email, password) {
      if (!email || !password) {
        showStatus("Please enter email and password.", "#ffcc66");
        return false;
      }
  
      if (password.length < 8) {
        showStatus(
          "Password must contain at least 8 characters.",
          "#ffcc66"
        );
        return false;
      }
  
      return true;
    }
  
    try {
      const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );
  
      const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
  
      // LOAD PROFILE
      async function loadProfile(user) {
        if (!user) return;
  
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, skills")
          .eq("id", user.id)
          .maybeSingle();
  
        if (error) {
          console.error("Profile loading error:", error.message);
  
          showStatus(
            "Logged in, but profile could not be loaded.",
            "#ffcc66"
          );
  
          return;
        }
  
        const nameField = document.getElementById("user-name");
        const emailField = document.getElementById("user-email");
        const skillsField = document.getElementById("user-skills");
  
        if (nameField && data && data.full_name) {
          nameField.value = data.full_name;
          localStorage.setItem("svName", data.full_name);
        }
  
        if (emailField) {
          emailField.value = user.email || "";
        }
  
        if (skillsField && data && data.skills) {
          skillsField.value = data.skills;
          localStorage.setItem("svSkills", data.skills);
        }
  
        const profileName = document.getElementById("profile-name");
  
        if (profileName && data && data.full_name) {
          profileName.textContent = data.full_name;
        }
      }
  
      // SAVE PROFILE
      async function saveProfileToDatabase() {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
  
        if (sessionError) {
          showStatus(sessionError.message, "#ff7777");
          return;
        }
  
        const user = sessionData?.session?.user;
  
        if (!user) {
          showStatus(
            "Please login before saving your online profile.",
            "#ffcc66"
          );
          return;
        }
  
        const nameField = document.getElementById("user-name");
        const skillsField = document.getElementById("user-skills");
  
        const fullName = nameField?.value.trim() || "";
        const skills = skillsField?.value.trim() || "";
  
        const { error } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name: fullName,
              email: user.email || "",
              skills: skills
            },
            {
              onConflict: "id"
            }
          );
  
        if (error) {
          console.error("Profile save error:", error.message);
  
          showStatus(
            "Profile save failed: " + error.message,
            "#ff7777"
          );
  
          return;
        }
  
        localStorage.setItem("svName", fullName);
        localStorage.setItem("svSkills", skills);
  
        showStatus(
          "Your online profile was saved successfully!",
          "#39dcca"
        );
      }
  
      // SIGNUP
      signupButton.addEventListener("click", async function () {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
  
        if (!validateInputs(email, password)) return;
  
        signupButton.disabled = true;
        showStatus("Creating your account...");
  
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
  
            options: {
              emailRedirectTo: REDIRECT_URL
            }
          });
  
          if (error) throw error;
  
          if (data.session && data.user) {
            setAuthButtons(true);
  
            await loadProfile(data.user);
  
            showStatus(
              "Account created and logged in successfully!",
              "#39dcca"
            );
          } else {
            showStatus(
              "Account created! Please check your email and confirm your account before logging in.",
              "#39dcca"
            );
          }
  
        } catch (error) {
          console.error("Signup error:", error);
  
          showStatus(error.message, "#ff7777");
  
        } finally {
          signupButton.disabled = false;
        }
      });
  
      // LOGIN
      loginButton.addEventListener("click", async function () {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
  
        if (!email || !password) {
          showStatus("Please enter email and password.", "#ffcc66");
          return;
        }
  
        loginButton.disabled = true;
        showStatus("Logging in...");
  
        try {
          const { data, error } =
            await supabase.auth.signInWithPassword({
              email: email,
              password: password
            });
  
          if (error) throw error;
  
          setAuthButtons(true);
  
          await loadProfile(data.user);
  
          showStatus(
            "Login successful! Welcome to SKILLVERSE.",
            "#39dcca"
          );
  
        } catch (error) {
          console.error("Login error:", error);
  
          showStatus(error.message, "#ff7777");
  
        } finally {
          loginButton.disabled = false;
        }
      });
  
      // LOGOUT
      logoutButton.addEventListener("click", async function () {
        logoutButton.disabled = true;
  
        try {
          const { error } = await supabase.auth.signOut();
  
          if (error) throw error;
  
          setAuthButtons(false);
          passwordInput.value = "";
  
          showStatus(
            "You have logged out successfully.",
            "#d5d7ef"
          );
  
        } catch (error) {
          showStatus(error.message, "#ff7777");
  
        } finally {
          logoutButton.disabled = false;
        }
      });
  
      // EXISTING SAVE PROFILE BUTTON
      const saveProfileButton =
        document.getElementById("save-profile");
  
      if (saveProfileButton) {
        saveProfileButton.addEventListener(
          "click",
          saveProfileToDatabase
        );
      }
  
      // RESTORE LOGIN SESSION
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
  
      if (sessionError) throw sessionError;
  
      const currentUser = sessionData?.session?.user;
  
      if (currentUser) {
        setAuthButtons(true);
  
        emailInput.value = currentUser.email || "";
  
        await loadProfile(currentUser);
  
        showStatus(
          "You are logged in to SKILLVERSE.",
          "#39dcca"
        );
  
      } else {
        setAuthButtons(false);
  
        showStatus(
          "Create an account or login to save your profile online."
        );
      }
  
      // AUTH STATE CHANGES
      supabase.auth.onAuthStateChange(function (event, session) {
        if (event === "SIGNED_IN" && session?.user) {
          setAuthButtons(true);
        }
  
        if (event === "SIGNED_OUT") {
          setAuthButtons(false);
        }
      });
  
      console.info("SKILLVERSE Supabase authentication initialized.");
  
    } catch (error) {
      console.error("SKILLVERSE Supabase error:", error);
  
      showStatus(
        "Could not connect to Supabase. Check your internet connection and project settings.",
        "#ff7777"
      );
    }
  });
  
