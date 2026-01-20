// noSchool/aggregations.ts
import NoSchoolModel from "./models";

export class NoSchool {
  constructor(
    public id: number,
    public date: string,              // "YYYY-MM-DD"
    public reason?: string | null,
    public createdBy?: string | null
  ) {}
}

export const populateNoSchool = (ns: any): NoSchool => {
  return new NoSchool(
    ns.id,
    ns.date,
    ns.reason ?? null,
    ns.createdBy ?? null
  );
};
