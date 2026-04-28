function loadRolesButtons() {
  const showUserBtn = document.querySelector(".show-users-btn");
  const addUserBtn = document.querySelector(".add-user-btn");
  const editBtn = document.querySelector(".edit-btn");
  const leaveBtn = document.querySelector(".leave-btn");

  const usersBox = document.querySelector(".users-box");

  const addUserPopup = document.querySelector("#addUserPopup");
  const editRolePopup = document.querySelector("#editRolePopup");
  const leaveRolePopup = document.querySelector("#leaveRolePopup");

  console.log("showUserBtn:", showUserBtn);
  console.log("addUserBtn:", addUserBtn);
  console.log("editBtn:", editBtn);
  console.log("leaveBtn:", leaveBtn);

  console.log("addUserPopup:", addUserPopup);
  console.log("editRolePopup:", editRolePopup);
  console.log("leaveRolePopup:", leaveRolePopup);

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

  if (editBtn && editRolePopup) {
    editBtn.addEventListener("click", () => {
      console.log("Edit clicked");
      editRolePopup.classList.remove("hidden");
    });
  } else {
    console.log("Edit button or popup missing");
  }

  if (leaveBtn && leaveRolePopup) {
    leaveBtn.addEventListener("click", () => {
      console.log("Leave clicked");
      leaveRolePopup.classList.remove("hidden");
    });
  } else {
    console.log("Leave button or popup missing");
  }

  const closePopupButtons = document.querySelectorAll(".close-popup");

  closePopupButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".popup-overlay").classList.add("hidden");
    });
  });
}

document.addEventListener("DOMContentLoaded", loadRolesButtons);