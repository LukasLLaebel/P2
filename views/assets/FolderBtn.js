document.getElementById("addFolderBtn").addEventListener("click", () => {
    const folderName = prompt("Enter folder name:");
  
    if (!folderName || folderName.trim() === "") return;
  
    // Lav nyt folder element
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
  
    // indsæt før knappen (så knappen altid er nederst)
    folderWrapper.insertBefore(newFolder, document.getElementById("addFolderBtn"));
  });