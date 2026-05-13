import { ShareModel } from "../models/share.model.js";

export const FilesService = {
  getFilesByFolderId: (folderId) => {
    const folder = ShareModel.findShareById(folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }
    return folder.files || [];
  },

  getFolderById: (folderId) => {
    const folder = ShareModel.findShareById(folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }
    return folder;
  }
};
