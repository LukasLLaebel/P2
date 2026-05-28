function DownloadBtn() {
  const buttons = document.querySelectorAll('[data-action="download"]');

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      // Finds file information
      const fileItem = btn.closest(".file-item");
      const fileName = fileItem.getAttribute("data-file");
      const shareId = new URLSearchParams(window.location.search).get("folder");

      if (!fileName || !shareId) return;

      const url = `/files/download/${shareId}/${encodeURIComponent(fileName)}`;
      console.log("Download URL:", url);
      try {
        const res = await fetch(url);

        // Checks permission
        if (!res.ok) {
          const data = await res.json();
          alert("Error: " + data.message);
          return;
        }

        // Downloads file 
        window.location.href = url;

      } catch (error) {
        console.error(error);
        alert("Failed to download file");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", DownloadBtn);

function UploadBtn() {
  const buttons = document.querySelectorAll('[data-action="upload"]');

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Finds file information
      const fileItem = btn.closest(".file-item");
      const fileName = fileItem.getAttribute("data-file");
      const shareId = new URLSearchParams(window.location.search).get("folder");

      // Creates file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt";

      input.addEventListener("change", async (event) => {
        // Finds selected file
        const file = event.target.files[0];
        if (!file) return;

        // Creates form data for upload 
        const formData = new FormData();
        formData.append("file", file);
        formData.append("shareId", shareId);
        formData.append("oldFileName", fileName);

        try {
          // Sends upload request
          const res = await fetch("/files/upload", {
            method: "POST",
            body: formData
          });

          const data = await res.json();

          // Shows popup if failed or successful upload
          if (!data.success) {
            alert('Error: ' + data.message);
            return;
          }
          alert("File uploaded succesfully");

        } catch (error) {
          console.error(error);
          alert('Failed to upload');
        }
      });
      input.click();
    });
  });
}
document.addEventListener("DOMContentLoaded", UploadBtn);
