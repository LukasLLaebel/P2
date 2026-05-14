// Adds a new file and prompts for name
document.addEventListener("DOMContentLoaded", () => {
    const shareId = new URLSearchParams(window.location.search).get("folder");
    const buttons = document.querySelectorAll(".create-file-btn");
    const handleCreateFile = async () => {
      let fileName = prompt("Enter file name:");
      if (!fileName) return;
      if (!fileName.endsWith(".txt")) {
        fileName += ".txt";
      }

      try {
        const response = await fetch("/files/create", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({file: fileName, shareId: shareId})
        });
  
        const data = await response.json();
        
        if (!data.success) {
          alert('Error: ' + data.message);
          return;
        }
        
        const folderWrapper = document.querySelector(".folder-wrapper");
  
        const emptyState = document.querySelector(".empty-state-container");
        if (emptyState) emptyState.remove();
  
        const newFile = document.createElement("div");
        newFile.classList.add("file-new");
  
        newFile.innerHTML = `
          <h1>${data.file}</h1>
          <div class="btn-wrapper">
            <h2 style="background-color: #7B9669">Edit</h2>
            <h2 style="background-color: #6C8480">Download</h2>
            <h2 style="background-color: #404E3B">Upload</h2>
          </div>
        `;

      const addBtn = document.querySelector(".create-file-btn");
      folderWrapper.appendChild(newFile);
    
    } catch (error) {
      console.error(error);
      alert('Failed to create file');
    }
  };
  
  buttons.forEach(btn => {
    btn.addEventListener("click", handleCreateFile);
  });
  });