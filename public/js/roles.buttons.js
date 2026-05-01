function loadRolesButtons() {
  const showUserBtns = document.querySelectorAll(".show-users-btn");
  const addUserBtns = document.querySelectorAll(".add-user-btn");
  const editBtns = document.querySelectorAll(".edit-btn");
  const leaveBtns = document.querySelectorAll(".delete-btn");

  const usersBox = document.querySelectorAll(".users-box");

  const addUserPopup = document.querySelector("#addUserPopup");
  const editRolePopup = document.querySelector("#editRolePopup");
  const leaveRolePopup = document.querySelector("#deleteRolePopup");

  console.log("showUserBtn:", showUserBtns);
  console.log("addUserBtn:", addUserBtns);
  console.log("editBtn:", editBtns);
  console.log("leaveBtn:", leaveBtns);

  console.log("addUserPopup:", addUserPopup);
  console.log("editRolePopup:", editRolePopup);
  console.log("leaveRolePopup:", leaveRolePopup);

  if (addUserPopup) {
    addUserBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("Add user clicked");
        addUserPopup.classList.remove("hidden");
      });
    });
  } else {
    console.log("Add User popup missing");
  }

  if (editRolePopup) {
    editBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("Edit clicked");
        editRolePopup.classList.remove("hidden");
      });
    });
  } else {
    console.log("Edit popup missing");
  }

  if (leaveRolePopup) {
    leaveBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("Leave clicked");
        leaveRolePopup.classList.remove("hidden");
      });
    });
  } else {
    console.log("Leave popup missing");
  }


  showUserBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      console.log("Show users clicked");

      if (usersBox[index]) {
        usersBox[index].classList.toggle("hidden");
      }
    });
  });

  const closePopupButtons = document.querySelectorAll(".close-popup");

  closePopupButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".popup-overlay").classList.add("hidden");
    });
  });
}

async function loadRoles(id) {
  //rollerne ligger måske et fucked up sted
  const res = await fetch(`/roles/getRolesFromFolder/${id}`);
  const files = await res.json();

  console.log(files);
  return files;
}

function createUser(name, isActive = false) {
  const user = document.createElement("div");
  user.classList.add("user");

  if (isActive) {
    user.classList.add("active-user");
  }

  const profilePic = document.createElement("div");
  profilePic.classList.add("profile-pic");

  const img = document.createElement("img");
  img.src = "./";
  img.alt = "PP";

  img.onerror = function () {
    this.style.display = "none";
    this.nextElementSibling.style.display = "inline-block";
  };

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-user");
  icon.style.display = "none";

  profilePic.appendChild(img);
  profilePic.appendChild(icon);

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("name");
  nameDiv.textContent = name;

  user.appendChild(profilePic);
  user.appendChild(nameDiv);

  const remove = document.createElement("div");
  remove.classList.add("remove");
  remove.textContent = "X";
  user.appendChild(remove);

  return user;
}

async function loadUsers(id) {
  const res = await fetch(`/roles/getUsersWithRole/${id}`);
  const users = await res.json();

  console.log(users);
  return users;
  
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
    container.innerHTML = "";
    
    for (const role of rolesArray) {
      const roleElement = document.createElement("div");
      roleElement.classList.add('role-header');
      const roleName = document.createElement('h1');
      roleName.textContent = role.name;

      const usersBox = document.createElement("div");
      usersBox.classList.add("users-box", "hidden");

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

      const usersArray = await loadUsers(role.id);
      usersArray.forEach(user => {
        usersBox.appendChild(createUser(user.username));
      })

      const topRow = document.createElement("div");
      topRow.classList.add("role-top");

      topRow.appendChild(roleName);
      topRow.appendChild(btnWrapper);

      roleElement.appendChild(topRow);
      roleElement.appendChild(usersBox);
      btnWrapper.appendChild(showUsersBtn);
      btnWrapper.appendChild(addUserBtn);
      btnWrapper.appendChild(editBtn);
      btnWrapper.appendChild(deleteBtn);
      container.appendChild(roleElement);
    };
  } catch (error) {
    console.error("Error loading files:", error);
  }
}  

document.addEventListener("DOMContentLoaded", async () => {
  await createRoles(
    new URLSearchParams(document.location.search).get("folder")
  );

  loadRolesButtons();
});