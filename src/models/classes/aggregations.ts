import { Class } from "./models";

export const populateClass = (cls: any): Class => {
  return new Class(
    cls.id,
    cls.name,
    cls.time,
    cls.created_at, // first comes created_at
    cls.days,        // then days
    cls.zoom_link, // then zoom_link
    cls.recordings_folder_link // then recordings_folder_link
  );
};
