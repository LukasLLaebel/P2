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
createRoles(new URLSearchParams(document.location.search).get("folder"));

async function loadRoles(id) {
  //rollerne ligger måske et fucked up sted
  const res = await fetch(`/roles/getRolesFromFolder/${id}`);
  const files = await res.json();

  console.log(files);
  return files;
}

async function createRoles(id) {
  try {
    const title = document.querySelector(".title");
    const res = await fetch(`/files/getFolder/${id}`);
    const folder = await res.json();
    title.textContent = `${folder.name}`;

    const rolesArray = await loadRoles(id);
    
    console.log("Roles Array:", rolesArray);

    const container = document.querySelector(".roles-wrapper");
    //container.innerHTML = "";
    
    rolesArray.forEach(role => {
      const roleElement = document.createElement("div");
      roleElement.classList.add('role-header');
      const roleName = document.createElement('h1');
      roleName.textContent = role.name;

      const btnWrapper = document.createElement("div");
      btnWrapper.classList.add('buttons');

      const showUsersBtn = document.createElement('button');
      showUsersBtn.classList.add('show-users-btn','users-wrapper');
      showUsersBtn.setAttribute("type", "button");
      const usersIcon = document.createElement('i');
      usersIcon.classList.add('fa-solid','fa-users');
      showUsersBtn.appendChild(usersIcon);  
      const userIconText = document.createElement('h2');
      userIconText.textContent = "3";
      showUsersBtn.appendChild(userIconText);

      const addUserBtn = document.createElement('button');
      addUserBtn.classList.add('add-user-btn');
      addUserBtn.setAttribute("type", "button");
      const addUsersIcon = document.createElement('i');
      addUsersIcon.classList.add('fa-solid','fa-user-plus');
      addUserBtn.appendChild(addUsersIcon);

      const editBtn = document.createElement('button');
      editBtn.classList.add('edit-btn');
      editBtn.setAttribute("type", "button");
      const editIcon = document.createElement('i');
      editIcon.classList.add('fa-solid','fa-pen-to-square');
      editBtn.appendChild(editIcon);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.setAttribute("type", "button");
      const deleteIcon = document.createElement('i');
      deleteIcon.classList.add('fa-solid','fa-x');
      deleteBtn.appendChild(deleteIcon);

      roleElement.appendChild(roleName);
      btnWrapper.appendChild(showUsersBtn);
      btnWrapper.appendChild(addUserBtn);
      btnWrapper.appendChild(editBtn);
      btnWrapper.appendChild(deleteBtn);
      roleElement.appendChild(btnWrapper);
      container.appendChild(roleElement);
    });
  } catch (error) {
    console.error("Error loading files:", error);
  }

  document.addEventListener("DOMContentLoaded", loadRolesButtons);
}  

document.addEventListener("DOMContentLoaded", loadRolesButtons);