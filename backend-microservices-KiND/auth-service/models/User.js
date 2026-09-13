const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Role hierarchy, lowest to highest privilege:
//   user        -> storefront customer (unchanged from before)
//   staff       -> dashboard access, limited admin actions
//   admin       -> full admin dashboard access
//   super_admin -> admin + can manage other admins/staff accounts
// "user" is intentionally kept separate from the staff/admin/super_admin
// tier — a customer and a staff member are different concepts even though
// they live in the same collection.
const ROLES = ['user', 'staff', 'admin', 'super_admin'];

const refreshTokenSchema = new mongoose.Schema(
  {
    // Never store the raw refresh token — only its SHA-256 hash. If the DB
    // leaks, the tokens inside it are useless without the original value.
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdByIp: { type: String, default: '' },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    // Whether the cookie this token was issued into is persistent (survives
    // closing the browser) or session-only (browser deletes it on close).
    // Preserved across rotation so a "don't remember me" login can't
    // accidentally become persistent just because the access token expired
    // and got silently refreshed during the same browser session — see
    // utils/cookies.js and rotateRefreshToken in utils/tokens.js.
    rememberMe: { type: Boolean, default: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Home", "Office"
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true },
    // Not required for Google-authenticated accounts — see the pre-save
    // hook below and googleLogin() in authController for why.
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    // Set only for accounts created (or linked) via "Sign in with Google".
    // Sparse + unique so multiple non-Google users can all have
    // googleId: undefined without violating the unique index.
    googleId: { type: String, default: null, unique: true, sparse: true },
    name:     { type: String, required: true },
    phone:    { type: String, default: '' },
    address:  { type: String, default: '' },
    addresses: { type: [addressSchema], default: [] },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ROLES, default: 'user' },

    // Dashboard's "activate/deactivate user" feature. Deactivated users
    // (customers or staff) can't log in — checked in authController.
    isActive: { type: Boolean, default: true },

    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    // Bounded list of active/recent refresh tokens for this user. Capped at
    // a small number per user (see authController) so a stolen-but-unused
    // old token can't accumulate forever; rotated on every use.
    refreshTokens: { type: [refreshTokenSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
