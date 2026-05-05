// Adds a new folder and prompts for name
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".create-folder-btn");
  const handleCreateFolder = async () => {
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

      const emptyState = document.querySelector(".empty-state-container");
      if (emptyState) emptyState.remove();

      const newFolder = document.createElement("div");
      newFolder.classList.add("folder-new");

      newFolder.innerHTML = `
        <h1>${data.folder.name}</h1>
        <div class="btn-wrapper">
          <h2 style="background-color: #404e3b">You</h2>
          <h2 style="background-color: #6c8480">Users (${data.folder.users.length})</h2>
        </div>
      `;
    const addBtn = folderWrapper.querySelector(".create-folder-btn");
    folderWrapper.insertBefore(newFolder, addBtn);
  
  } catch (error) {
    console.error(error);
    alert('Failed to create folder');
  }
};

buttons.forEach(btn => {
  btn.addEventListener("click", handleCreateFolder);
});
});