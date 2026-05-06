import { FilesService } from "../services/files.service.js";

// gets files from ID 
export const getFiles = (req, res) => {
  try {
    const id = Number(req.params.id);
    const files = FilesService.getFilesByFolderId(id);
    res.json(files);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getFolder = (req, res) => {
  try {
    const id = Number(req.params.id);
    const folder = FilesService.getFolderById(id);
    res.json(folder);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
