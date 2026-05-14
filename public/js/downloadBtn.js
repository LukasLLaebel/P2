function DownloadBtn() {
    const buttons = document.querySelectorAll('[data-action="download"]');
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const fileItem = btn.closest(".file-item");
            const fileName = fileItem.getAttribute("data-file");
            const shareId = new URLSearchParams(window.location.search).get("folder");

            if (!fileName || !shareId) return;

            window.location.href = `/files/download/${shareId}/${encodeURIComponent(fileName)}`;
        });
    });
}
document.addEventListener("DOMContentLoaded", DownloadBtn);

function UploadBtn() {
    const buttons = document.querySelectorAll('[data-action="upload"]');
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const fileItem = btn.closest(".file-item");
            const fileName = fileItem.getAttribute("data-file");
            const shareId = new URLSearchParams(window.location.search).get("folder");

            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".txt";

            input.addEventListener("change", async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("shareId", shareId);
                formData.append("oldFileName", fileName);

                try {
                    const res = await fetch("/files/upload", {
                        method: "POST", 
                        body: formData
                    });

                    const data = await res.json();
                    
                    if (!data.success) {
                        alert('Error: ' + data.message);
                        return;
                      }

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