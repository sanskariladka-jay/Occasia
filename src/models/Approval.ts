import mongoose, { Schema, Document } from 'mongoose';

export interface IApproval extends Document {
  event_id: mongoose.Types.ObjectId;
  actor_id: mongoose.Types.ObjectId;
  actor_role: string;
  action: 'submitted' | 'approved' | 'rejected' | 'forwarded' | 'cancelled';
  comment?: string;
  createdAt: Date;
}

const ApprovalSchema: Schema = new Schema({
  event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  actor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actor_role: { type: String, required: true },
  action: { type: String, enum: ['submitted', 'approved', 'rejected', 'forwarded', 'cancelled'], required: true },
  comment: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IApproval>('Approval', ApprovalSchema);
