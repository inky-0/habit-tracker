// Habits: create, read, update, delete, and daily check-ins.
// Each habit is a row in the "Habit" table on Back4App.

Parse.initialize(BACK4APP_APP_ID, BACK4APP_JS_KEY);
Parse.serverURL = "https://parseapi.back4app.com/";

const Habit = Parse.Object.extend("Habit");

const habitForm = document.getElementById("habit-form");
const habitNameInput = document.getElementById("habit-name");
const habitNotesInput = document.getElementById("habit-notes");
const habitList = document.getElementById("habit-list");
const emptyMessage = document.getElementById("empty-message");

// Dates are stored as "YYYY-MM-DD" strings in the checkIns array
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayKey() {
  return dateKey(new Date());
}

// Count how many days in a row the habit was checked off,
// ending today (or yesterday, if today isn't checked yet)
function currentStreak(checkIns) {
  const done = new Set(checkIns);
  const day = new Date();
  if (!done.has(dateKey(day))) {
    day.setDate(day.getDate() - 1);
  }
  let streak = 0;
  while (done.has(dateKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

// ----- READ: load the logged-in user's habits -----
async function loadHabits(retried = false) {
  const query = new Parse.Query(Habit);
  query.equalTo("owner", Parse.User.current());
  query.ascending("createdAt");
  try {
    const habits = await query.find();
    renderHabits(habits);
  } catch (error) {
    if (error.code === Parse.Error.INVALID_SESSION_TOKEN) {
      // A brand-new session can take a moment to register; try once more
      if (!retried) {
        setTimeout(() => loadHabits(true), 1000);
        return;
      }
      // Session really is invalid: send the user back to log in
      await Parse.User.logOut();
      showAuthScreen();
      return;
    }
    alert("Could not load habits: " + error.message);
  }
}

// ----- CREATE -----
habitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;

  const user = Parse.User.current();
  const habit = new Habit();
  habit.set("name", name);
  habit.set("notes", habitNotesInput.value.trim());
  habit.set("checkIns", []);
  habit.set("owner", user);

  // Only the owner can read or change their habits
  habit.setACL(new Parse.ACL(user));

  await habit.save();
  habitForm.reset();
  loadHabits();
});

// ----- UPDATE: check off / un-check today -----
async function toggleToday(habit) {
  const today = todayKey();
  const checkIns = habit.get("checkIns") || [];
  if (checkIns.includes(today)) {
    habit.remove("checkIns", today);
  } else {
    habit.addUnique("checkIns", today);
  }
  await habit.save();
  loadHabits();
}

// ----- UPDATE: edit name and notes -----
async function saveEdit(habit, name, notes) {
  habit.set("name", name);
  habit.set("notes", notes);
  await habit.save();
  loadHabits();
}

// ----- DELETE -----
async function deleteHabit(habit) {
  if (!confirm(`Delete "${habit.get("name")}"?`)) return;
  await habit.destroy();
  loadHabits();
}

// ----- Draw the list -----
function renderHabits(habits) {
  habitList.innerHTML = "";
  emptyMessage.hidden = habits.length > 0;

  habits.forEach((habit) => {
    const checkIns = habit.get("checkIns") || [];
    const doneToday = checkIns.includes(todayKey());
    const streak = currentStreak(checkIns);

    const item = document.createElement("li");
    item.className = "habit";

    // Normal view
    const view = document.createElement("div");
    view.className = "habit-view";

    const info = document.createElement("div");
    info.className = "habit-info";
    const title = document.createElement("h3");
    title.textContent = habit.get("name");
    const notes = document.createElement("p");
    notes.className = "notes";
    notes.textContent = habit.get("notes") || "";
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `Streak: ${streak} day${streak === 1 ? "" : "s"} · Done ${checkIns.length} time${checkIns.length === 1 ? "" : "s"}`;
    info.append(title, notes, meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = doneToday ? "done" : "primary";
    checkButton.textContent = doneToday ? "Done today" : "Mark done";
    checkButton.addEventListener("click", () => toggleToday(habit));

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteHabit(habit));

    actions.append(checkButton, editButton, deleteButton);
    view.append(info, actions);

    // Edit view (hidden until Edit is clicked)
    const editForm = document.createElement("form");
    editForm.className = "habit-edit";
    editForm.hidden = true;
    const nameInput = document.createElement("input");
    nameInput.value = habit.get("name");
    nameInput.required = true;
    const notesInput = document.createElement("input");
    notesInput.value = habit.get("notes") || "";
    notesInput.placeholder = "Notes (optional)";
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "primary";
    saveButton.textContent = "Save";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    editForm.append(nameInput, notesInput, saveButton, cancelButton);

    editButton.addEventListener("click", () => {
      view.hidden = true;
      editForm.hidden = false;
    });
    cancelButton.addEventListener("click", () => {
      editForm.hidden = true;
      view.hidden = false;
    });
    editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveEdit(habit, nameInput.value.trim(), notesInput.value.trim());
    });

    item.append(view, editForm);
    habitList.appendChild(item);
  });
}
