
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
  const res = await fetch("/shares/usersFromFile/" + id);
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

    const res = await fetch("/shares/getFolderOwner/" + id);
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


function loadFolderSearch() {
  const searchInput = document.getElementById("folderSearch");

  if (!searchInput) {
    console.error("Search input folder not found");
    return;
  }

  let abortController = null;

  searchInput.addEventListener("input", async () => {
    const searchText = searchInput.value.trim();

    if (abortController) abortController.abort();
    abortController = new AbortController();

    try {
      if (searchText === "") {
        document.querySelectorAll(".file-item").forEach((item) => {
          item.style.display = "";
        });
        return;
      }

      const res = await fetch(
        `/folders/search?q=${encodeURIComponent(searchText)}`
      );

      if (!res.ok) {
        console.error("Folder search request failed:", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      const searchedFolders = data.folders || [];
      const matchingIds = searchedFolders.map((f) => String(f.id));

      const folderItems = document.querySelectorAll(".file-item");
      folderItems.forEach((item) => {
        const folderId = item.getAttribute("id");

        if (matchingIds.includes(folderId)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    } catch (error) {
      if (error && error.name === "AbortError") return;
      console.error("Error searching folders:", error);
    }
  });
}



loadFolderSearch();




document.addEventListener("click", async (e) => {
  const tag = e.target.closest("h2");
  if (!tag) return;

  const action = tag.dataset.action;

  if (action === "owner") {
    alert("Not working yet, coming soon!");
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
  if (action === "user-search") {
    const modal = document.getElementById("user-modal");
    const fileItem = e.target.closest("user-modal");
    const id = modal.getAttribute("idd");

    popUp(id);
  }

  if (action === "user-add") {
    const modal = document.getElementById("user-modal");
    const fileItem = e.target.closest("user-modal");
    const id = Number(modal.getAttribute("idd"));
    console.log("ID in add user: " + id);
    const user = document.getElementById("user-add").value;

    console.log("ShareID " + id)
    console.log("User " + user)

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

  if (action === "rem-user") {
    const modal = document.getElementById("user-modal");
    const fileItem = e.target.closest("user-modal");
    const id = Number(modal.getAttribute("idd"));
    console.log("ID in add user: " + id);
    const user = e.target.closest("h2").getAttribute("data-user");

    console.log("ShareID " + id)
    console.log("User " + user)

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





