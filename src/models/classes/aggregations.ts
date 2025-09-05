import { Class } from "./models";

export const populateClass = (cls: any): Class => {
  return new Class(
    cls.id,
    cls.name,
    cls.time,
    cls.created_at, // first comes created_at
    cls.days        // then days
  );
};
