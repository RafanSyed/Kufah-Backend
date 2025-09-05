import ClassModel from "./models";
import { Class } from "./models";
import { ClassRequest } from "./types";
import { populateClass } from "./aggregations";

export const createClass = async (cls: ClassRequest): Promise<Class> => {
  const response: ClassModel = await ClassModel.create(cls as any);
  return populateClass(response.get({ plain: true }));
};

export const fetchClassById = async (id: number): Promise<Class> => {
  const cls: ClassModel | null = await ClassModel.findByPk(id);
  if (!cls) throw new Error(`Class with id ${id} not found`);
  return populateClass(cls.get({ plain: true }));
};

export const updateClass = async (
  id: number,
  updates: Partial<ClassRequest>
): Promise<Class> => {
  const cls: ClassModel | null = await ClassModel.findByPk(id);
  if (!cls) throw new Error(`Class with id ${id} not found`);
  await cls.update(updates);
  return populateClass(cls.get({ plain: true }));
};

export const deleteClass = async (id: number): Promise<void> => {
  const cls: ClassModel | null = await ClassModel.findByPk(id);
  if (!cls) throw new Error(`Class with id ${id} not found`);
  await cls.destroy();
};

export const fetchAllClasses = async (): Promise<Class[]> => {
  const classes: ClassModel[] = await ClassModel.findAll();
  return classes.map((c) => populateClass(c.get({ plain: true })));
};
