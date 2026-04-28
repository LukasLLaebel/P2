

  function popUp(id) {
    document.getElementById("user-modal").showModal();
    createUsers(id);
    document.querySelector(".overlay").style.display = "block";
  }

  function closePopUp() {
    document.getElementById("user-modal").close();
    document.querySelector(".overlay").style.display = "none"; 
  }


  async function loadUsers(id) {
    const res = await fetch("/shares/usersFromFile/"+id);
    const users = await res.json();

    console.log(users);
    return users;
  }

  async function createUsers(id) {
    try {
      let usersArray = await loadUsers(id);

      const searchValue = document.getElementById("user-search").value;
      console.log("Raw search:", `"${searchValue}"`);

      const search = searchValue.trim().toLowerCase();

      const filteredUsers = usersArray.filter(user =>
        user.username.trim().toLowerCase().includes(search)
      );

      usersArray = filteredUsers;


      console.log("Users Array:", usersArray);

      const container = document.getElementById("userList");
      container.innerHTML = "";

      const res = await fetch("/shares/getFolderOwner/"+id);
      const owner = await res.json();
      
      usersArray.forEach(user => {
        const userElement = document.createElement("div");
        userElement.classList.add('user-item');
        userElement.style.backgroundColor = "#BAC8B1";
        
        const btnWrapper = document.createElement("div");
        btnWrapper.classList.add('user-btn-wrapper');

        const userBtn = document.createElement('h2');
        userBtn.style.backgroundColor = "#7B9669";
        userBtn.setAttribute("data-action", "owner");
        userBtn.textContent = user.username;

        const remBtn = document.createElement('h2');
        console.log(user.username)
        console.log(owner.username)
        if (user.username != owner.username) {
          remBtn.style.backgroundColor = "#7B9669";
          remBtn.setAttribute("data-action", "rem-user");
          remBtn.setAttribute("data-user", user.username);
          remBtn.textContent = "Remove";
        }
        
        btnWrapper.appendChild(userBtn);
        if (user.username != owner.username) {
          btnWrapper.appendChild(remBtn);
        }  
        userElement.appendChild(btnWrapper);
        container.appendChild(userElement);
      });
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }  

  async function loadFiles() {
    const res = await fetch("/shares/files");
    const files = await res.json();

    console.log(files);
    return files;
  }

  async function createFiles() {
    try {
      const filesArray = await loadFiles();
      
      console.log("Files Array:", filesArray);

      const container = document.getElementById("folderList");
      container.innerHTML = "";
      
      filesArray.forEach(file => {
        const fileElement = document.createElement("div");
        fileElement.setAttribute("id", file.id);
        fileElement.classList.add('file-item');
        const fileName = document.createElement('h1');
        fileName.textContent = file.name;
        
        const btnWrapper = document.createElement("div");
        btnWrapper.classList.add('btn-wrapper');

        const ownerBtn = document.createElement('h2');
        ownerBtn.style.backgroundColor = "#7B9669";
        ownerBtn.setAttribute("data-action", "owner");
        ownerBtn.textContent = "You";

        const usersBtn = document.createElement('h2');
        usersBtn.style.backgroundColor = "#6C8480";
        usersBtn.setAttribute("data-action", "colab-users");
        usersBtn.textContent = "Users";
        
        const rolesBtn = document.createElement('h2');
        rolesBtn.style.backgroundColor = "#404E3B";
        rolesBtn.setAttribute("data-action", "show-roles");
        rolesBtn.textContent = "Roles";

        fileElement.appendChild(fileName);
        btnWrapper.appendChild(ownerBtn);
        btnWrapper.appendChild(usersBtn);
        btnWrapper.appendChild(rolesBtn);
        fileElement.appendChild(btnWrapper);
        container.appendChild(fileElement);
      });
    } catch (error) {
      console.error("Error loading files:", error);
    }
  }  
  createFiles();

  document.addEventListener("click", async (e) => {
    const tag = e.target.closest("h2");
    if (!tag) return;

    const action = tag.dataset.action;

    if (action === "owner") {
      alert("Jeff clicked!");
    }

    if (action === "colab-users") {
      const modal = document.getElementById("user-modal");
      const fileItem = e.target.closest(".file-item");
      const id = fileItem?.id;
      modal.setAttribute("idd", id);

      if (modal.open) {
        closePopUp();
      } else {
        popUp(id);
      }
    }
    if (action === "user-search"){
      const modal = document.getElementById("user-modal");
      const fileItem = e.target.closest("user-modal");
      const id = modal.getAttribute("idd");

      popUp(id);
    }

    if (action === "user-add"){
      const modal = document.getElementById("user-modal");
      const fileItem = e.target.closest("user-modal");
      const id = Number(modal.getAttribute("idd"));
      console.log("ID in add user: "+id);
      const user = document.getElementById("user-add").value;

      console.log("ShareID "+id)
      console.log("User "+user)

      const formData = {
        username: user,
        shareId: id,
      };
        
      try {
        const response = await fetch('/shares/useradd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('Share shared successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to share share');
      }
      
      popUp(id);
    }

    if (action === "rem-user"){
      const modal = document.getElementById("user-modal");
      const fileItem = e.target.closest("user-modal");
      const id = Number(modal.getAttribute("idd"));
      console.log("ID in add user: "+id);
      const user = e.target.closest("h2").getAttribute("data-user");

      console.log("ShareID "+id)
      console.log("User "+user)

      const formData = {
        username: user,
        shareId: id,
      };
        
      try {
        const response = await fetch('/shares/userrem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('Share removed from user successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove share from user');
      }
      
      popUp(id);
    }
  });
  