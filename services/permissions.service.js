import { ShareModel } from "../models/share.model.js";

export const getAllPermissions = async () => {
  const data = ShareModel.getAllData();
  return data.permissions.map(({ name }) => name);
}

