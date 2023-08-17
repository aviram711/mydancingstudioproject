export interface Course {
  id: number;
  courseType: string;
  teachers: string;
  childIDs: number[];
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface APIFetchedCourse {
  courseType: string;
  id: number;
  teachers: string;
  childID: number;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
}

export type Schedule = {
  dayOfWeek: string;
  startTime: string | undefined;
  endTime: string;
}
