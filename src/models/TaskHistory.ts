import { Schema, model, models, Document } from 'mongoose';

export interface ITaskHistory extends Document {
  type: string;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  executedAt: Date;
  result?: string;
  nextRun?: Date;
}

const TaskHistorySchema = new Schema<ITaskHistory>({
  type: { type: String, required: true },
  status: { type: String, enum: ['completed', 'running', 'failed', 'scheduled'], required: true },
  executedAt: { type: Date, required: true },
  result: { type: String },
  nextRun: { type: Date }
}, {
  timestamps: true
});

export default models.TaskHistory || model<ITaskHistory>('TaskHistory', TaskHistorySchema); 