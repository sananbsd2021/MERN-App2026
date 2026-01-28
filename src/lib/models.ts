import { Schema, model, models } from 'mongoose';

// User Schema
const UserSchema = new Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'SARABAN', 'EXECUTIVE', 'STAFF'], default: 'SARABAN' },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);

// Document Schema
const DocumentSchema = new Schema({
    docNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Document = models.Document || model('Document', DocumentSchema);

// DocumentRecipient Schema
const RecipientSchema = new Schema({
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'RECEIVED', 'READ'], default: 'PENDING' },
    receivedAt: { type: Date },
    readAt: { type: Date },
}, { timestamps: true });

export const DocumentRecipient = models.DocumentRecipient || model('DocumentRecipient', RecipientSchema);

// AuditLog Schema
const AuditLogSchema = new Schema({
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['SEND', 'RECEIVE', 'READ', 'LOGIN', 'LOGOUT', 'CREATE_ORDER', 'DELETE_ORDER', 'CREATE_MEMO', 'DELETE_MEMO', 'CREATE_LETTER', 'DELETE_LETTER', 'CREATE_INCOMING', 'DELETE_INCOMING'], required: true },
    refId: { type: Schema.Types.ObjectId, refPath: 'refModel' }, // Generic reference ID for different collections
    refModel: { type: String, required: true, enum: ['Document', 'Order', 'Memorandum', 'Letter', 'IncomingLetter'] }, // To specify which collection refId points to
    ipAddress: { type: String },
}, { timestamps: true });

export const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);

// Order Schema
const OrderSchema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    documentDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    originalName: { type: String }, // Store original filename
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Order = models.Order || model('Order', OrderSchema);

// Memorandum Schema
const MemorandumSchema = new Schema({
    memoNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    documentDate: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    originalName: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });


export const Memorandum = models.Memorandum || model('Memorandum', MemorandumSchema);

// Letter Schema (Outgoing)
const LetterSchema = new Schema({
    letterNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    to: { type: String, required: true },
    fileUrl: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Letter = models.Letter || model('Letter', LetterSchema);

// IncomingLetter Schema (Incoming)
const IncomingLetterSchema = new Schema({
    receiveNumber: { type: String, required: true, unique: true }, // เลขรับ
    refNumber: { type: String }, // ที่ (เลขที่หนังสือจากต้นทาง)
    title: { type: String, required: true },
    date: { type: Date, required: true }, // ลงวันที่
    receivedDate: { type: Date, default: Date.now }, // วันที่รับ
    from: { type: String, required: true }, // จาก
    to: { type: String, required: true }, // ถึง
    fileUrl: { type: String, required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ผู้ลงรับ
}, { timestamps: true });

export const IncomingLetter = models.IncomingLetter || model('IncomingLetter', IncomingLetterSchema);

// DailyLog Schema
const DailyLogSchema = new Schema({
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    note: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const DailyLog = models.DailyLog || model('DailyLog', DailyLogSchema);
