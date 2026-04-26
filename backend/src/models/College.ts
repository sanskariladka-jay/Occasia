import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment {
  name: string;
  branches: string[];
}

export interface ICollege extends Document {
  name: string;
  code: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  departments: IDepartment[];
  foundedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CollegeSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  contact_email: { type: String },
  contact_phone: { type: String },
  address: { type: String },
  departments: [{
    name: { type: String, required: true },
    branches: [String]
  }],
  foundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model<ICollege>('College', CollegeSchema);
