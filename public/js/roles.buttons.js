function loadRolesButtons() {
  const showUserBtn = document.querySelector(".show-users-btn");
  const addUserBtn = document.querySelector(".add-user-btn");
  const editBtn = document.querySelector(".edit-btn");
  const deleteBtn = document.querySelector(".delete-btn");

  const usersBox = document.querySelector(".users-box");

  const addUserPopup = document.querySelector("#addUserPopup");
  const editRolePopup = document.querySelector("#editRolePopup");
  const deleteRolePopup = document.querySelector("#deleteRolePopup");

  const roleTitle = document.querySelector(".role-title");
  const roleTitleInput = document.querySelector("#roleTitleInput");
  const saveRoleTitleBtn = document.querySelector("#saveRoleTitleBtn");

  console.log("Role Title:", roleTitle);
  console.log("Role Title Input:", roleTitleInput);
  console.log("Save Role Title Button:", saveRoleTitleBtn);

  console.log("showUserBtn:", showUserBtn);
  console.log("addUserBtn:", addUserBtn);
  console.log("editBtn:", editBtn);
  console.log("deleteBtn:", deleteBtn);

  console.log("addUserPopup:", addUserPopup);
  console.log("editRolePopup:", editRolePopup);
  console.log("deleteRolePopup:", deleteRolePopup);

  if (showUserBtn && usersBox) {
    showUserBtn.addEventListener("click", () => {
      console.log("Show users clicked");
      usersBox.classList.toggle("hidden");
    });
  }

  if (addUserBtn && addUserPopup) {
    addUserBtn.addEventListener("click", () => {
      console.log("Add user clicked");
      addUserPopup.classList.remove("hidden");
    });
  } else {
    console.log("Add User button or popup missing");
  }

  if (editBtn && editRolePopup && roleTitle && roleTitleInput) {
    editBtn.addEventListener("click", () => {
      console.log("Edit clicked");

      roleTitleInput.value = roleTitle.textContent.trim();

      editRolePopup.classList.remove("hidden");
    });
  } else {
    console.log("Edit button, popup, role title, or input missing");
  }

  if (saveRoleTitleBtn && roleTitle && roleTitleInput && editRolePopup) {
    saveRoleTitleBtn.addEventListener("click", () => {
      console.log("Save role title clicked");

      roleTitle.textContent = roleTitleInput.value.trim();

      editRolePopup.classList.add("hidden");
    });
  } else {
    console.log("Save role title button, role title, input, or popup missing");
  }

  if (deleteBtn && deleteRolePopup) {
    deleteBtn.addEventListener("click", () => {
      console.log("Delete clicked");
      deleteRolePopup.classList.remove("hidden");
    });
  } else {
    console.log("Delete button or popup missing");
  }

  const closePopupButtons = document.querySelectorAll(".close-popup");

  closePopupButtons.forEach((button) =>{ 
    button.addEventListener("click", () => {
      button.closest(".popup-overlay").classList.add("hidden");
    });
  });
}

document.addEventListener("DOMContentLoaded", loadRolesButtons);