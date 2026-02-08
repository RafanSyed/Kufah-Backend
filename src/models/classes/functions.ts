import ClassModel from "./models";
import { Class } from "./models";
import { ClassRequest } from "./types";
import { populateClass } from "./aggregations";
import { Op } from "sequelize";
import { toZonedTime, format } from "date-fns-tz";

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

export async function fetchClassesToday() {
  const timeZone = "America/New_York";
  const now = toZonedTime(new Date(), timeZone);
  const day = format(now, "EEE", { timeZone }); // "Sun", "Mon", ...

  // IMPORTANT: order by the actual column name (string), NOT a Number()
  const classes = await ClassModel.findAll({
    where: {
      days: { [Op.contains]: [day] }, // Postgres array contains
    },
    order: [["time", "ASC"]], // "HH:mm" sorts correctly lexicographically
  });

  return classes.map((c) => populateClass(c.get({ plain: true })));
}