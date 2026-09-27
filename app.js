// Habit Tracker app logic
// Handles register / log in / log out. (Parse is initialized in habits.js,
// which loads first.)

// ----- Page elements -----
const authView = document.getElementById("auth-view");
const habitsView = document.getElementById("habits-view");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showLoginTab = document.getElementById("show-login");
const showRegisterTab = document.getElementById("show-register");
const authError = document.getElementById("auth-error");
const currentUsername = document.getElementById("current-username");
const logoutButton = document.getElementById("logout-button");

// ----- Screens -----
function showAuthScreen() {
  habitsView.hidden = true;
  authView.hidden = false;
  switchTab(false); // always come back to the Log in tab
}

function showHabitsScreen(user) {
  authView.hidden = true;
  habitsView.hidden = false;
  currentUsername.textContent = user.getUsername();
  loadHabits();
}

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = false;
}

// Switch between the Log in and Register tabs
function switchTab(showRegister) {
  registerForm.hidden = !showRegister;
  loginForm.hidden = showRegister;
  showRegisterTab.classList.toggle("active", showRegister);
  showLoginTab.classList.toggle("active", !showRegister);
  authError.hidden = true;
}
showLoginTab.addEventListener("click", () => switchTab(false));
showRegisterTab.addEventListener("click", () => switchTab(true));

// ----- Register -----
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = new Parse.User();
  user.set("username", document.getElementById("register-username").value.trim());
  user.set("email", document.getElementById("register-email").value.trim());
  user.set("password", document.getElementById("register-password").value);

  try {
    await user.signUp();
    registerForm.reset();
    showHabitsScreen(user);
  } catch (error) {
    showAuthError(error.message);
  }
});

// ----- Log in -----
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const user = await Parse.User.logIn(username, password);
    loginForm.reset();
    showHabitsScreen(user);
  } catch (error) {
    showAuthError(error.message);
  }
});

// ----- Log out -----
logoutButton.addEventListener("click", async () => {
  await Parse.User.logOut();
  showAuthScreen();
});

// ----- Start: stay logged in if a session already exists -----
const existingUser = Parse.User.current();
if (existingUser) {
  showHabitsScreen(existingUser);
} else {
  showAuthScreen();
}
