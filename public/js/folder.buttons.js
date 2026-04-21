
async function loadUsers() {
  const res = await fetch("/roles/users");
  const users = await res.json();

  console.log(users);
  return users;
}

document.querySelectorAll('h2').forEach(tag => {
  tag.addEventListener('click', () => {
    const action = tag.dataset.action;

    if (action === "owner") {
      alert("Jeff clicked!");
    }

    if (action === "colab-users") {
      if (document.getElementById("user-modal").open) {
        closePopUp();
        return;
      }
      popUp();
    }
  });
});

function popUp() {
  document.getElementById("user-modal").showModal();
  createUsers();
  document.querySelector(".overlay").style.display = "block";
}

function closePopUp() {
  document.getElementById("user-modal").close();
  document.querySelector(".overlay").style.display = "none"; 
}




async function createUsers() {
  try {
    const usersArray = await loadUsers();
    
    console.log("Users Array:", usersArray);

    const container = document.getElementById("userList");
    container.innerHTML = "";
    
    usersArray.forEach(user => {
      const userElement = document.createElement("div");
      userElement.classList.add('user-item');
      userElement.style.backgroundColor = "#BAC8B1";
      
      const btnWrapper = document.createElement("div");
      btnWrapper.classList.add('user-btn-wrapper');

      const btn = document.createElement('h2');
      btn.style.backgroundColor = "#7B9669";
      btn.setAttribute("data-action", "owner");
      btn.textContent = user;

      btnWrapper.appendChild(btn);
      userElement.appendChild(btnWrapper);
      container.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}  
