document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".create-folder-btn");

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const response = await fetch("/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: folderName })
      });

      const data = await response.json();

      if (!data.success) {
        alert("Error: " + data.message);
        return;
      }

      const folderWrapper = document.querySelector("#folderList") || document.querySelector(".folder-wrapper");
      if (!folderWrapper) {
        console.error("Folder wrapper not found (#folderList or .folder-wrapper).");
        return;
      }
      const emptyState = document.querySelector(".empty-state-container");
      if (emptyState) emptyState.remove();



      const newFolder = document.createElement("div");
      newFolder.className = "file-item";
      newFolder.id = data.folder.id;


      newFolder.innerHTML = `
        <a href="/files?folder=${encodeURIComponent(data.folder.id)}">
          <h1>${data.folder.name}</h1>
        </a>

        <div class="btn-wrapper">
          <h2 style="background-color:#7B9669" data-action="owner">You</h2>
          <h2 style="background-color:#6C8480" data-action="colab-users">Users</h2>
          <a href="/roles?folder=${encodeURIComponent(data.folder.id)}">
            <h2 style="background-color:#404E3B" data-action="show-roles">Roles</h2>
          </a>
        </div>
      `;

      folderWrapper.appendChild(newFolder);
    } catch (error) {
      console.error(error);
      alert("Failed to create folder");
    }
  };

  buttons.forEach((btn) => btn.addEventListener("click", handleCreateFolder));

});
