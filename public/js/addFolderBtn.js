// Adds a new folder and prompts for name
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("addFolderBtn");
  btn.addEventListener("click", async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const response = await fetch("/folders/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({folder: folderName})
      });

      const data = await response.json();
      
      if (!data.success) {
        alert('Error: ' + data.message);
        return;
      }
      
      const folderWrapper = document.querySelector(".folder-wrapper");

      const newFolder = document.createElement("div");
      newFolder.classList.add("folder-new");

      newFolder.innerHTML = `
        <h1>${data.folder.name}</h1>
        <div class="btn-wrapper">
          <h2 style="background-color: #404e3b">You</h2>
          <h2 style="background-color: #6c8480">Users (${data.folder.users.length})</h2>
        </div>
      `;

    folderWrapper.insertBefore(newFolder, btn);
  
  } catch (error) {
    console.error(error);
    alert('Failed to create folder');
  }
  })});