
  async function loadFiles(id) {
    const res = await fetch(`/files/getAllFiles/${id}`);
    const files = await res.json();

    console.log(files);
    return files;
  }

  async function createFiles(id) {
    try {
      const title = document.querySelector(".title");
      const res = await fetch(`/files/getFolder/${id}`);
      const folder = await res.json();
      title.textContent = `${folder.name}`;

      const filesArray = await loadFiles(id);
      
      console.log("Files Array:", filesArray);

      const container = document.getElementById("folderList");
      container.innerHTML = "";
      
      filesArray.forEach(file => {
        const fileElement = document.createElement("div");
        fileElement.setAttribute("id", file.id);
        fileElement.classList.add('file-item');
        const fileName = document.createElement('h1');
        fileName.textContent = file;
        
        const btnWrapper = document.createElement("div");
        btnWrapper.classList.add('btn-wrapper');

        const ownerBtn = document.createElement('h2');
        ownerBtn.style.backgroundColor = "#7B9669";
        ownerBtn.setAttribute("data-action", "edit");
        ownerBtn.textContent = "Edit";

        const usersBtn = document.createElement('h2');
        usersBtn.style.backgroundColor = "#6C8480";
        usersBtn.setAttribute("data-action", "download");
        usersBtn.textContent = "Download";
        fileElement.setAttribute("data-file", file);
        
        const rolesBtn = document.createElement('h2');
        rolesBtn.style.backgroundColor = "#404E3B";
        rolesBtn.setAttribute("data-action", "upload");
        rolesBtn.textContent = "Upload";

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
  const folderId = new URLSearchParams(document.location.search).get("folder");
  createFiles(folderId).then(() => {
    DownloadBtn();
  });

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
  
