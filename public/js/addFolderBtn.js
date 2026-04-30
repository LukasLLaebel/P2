// Adds a new folder and prompts for name
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("addFolderBtn");
  btn.addEventListener("click", () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    const folderWrapper = document.querySelector(".folder-wrapper");

    const newFolder = document.createElement("div");
    newFolder.classList.add("folder-new");

    newFolder.innerHTML = `
      <h1>${folderName}</h1>
      <div class="btn-wrapper">
        <h2 style="background-color: #404e3b">You</h2>
        <h2 style="background-color: #6c8480">Users (1)</h2>
      </div>
    `;

    folderWrapper.insertBefore(newFolder, btn);
  });
});