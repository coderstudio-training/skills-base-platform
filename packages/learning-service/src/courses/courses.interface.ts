export interface ValidationError {
  index: number;
  courseId: string;
  errors: string[];
}

export interface BulkUpsertResponse {
  updatedCount: number;
  errors: any[];
  validationErrors?: ValidationError[];
}

export interface Field {
  name: string;
  value: string;
}
