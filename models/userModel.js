const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      minLength: [3, "Name should have more than 3 characters"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: [true, "Email must be unique"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      unique: [true, "phone number must be unique"],
      sparse: true, // to make it optional [do not duplicate the key in db]
      trim: true,
    },
    profileImg: String,
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// create normal indexes on name or email
userSchema.index({ name: 1, email: 1 }, { unique: true });

// TODO: Hash password on create [on save document in DB only]
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// mongoose middleware
const handleUploadImg = (doc) => {
  if (doc.profileImg && !doc.profileImg.startsWith("http")) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.profileImg = imageUrl;
  }
};

// findOne, findMany, update [ال init بتشتغل عند الاستدعاء و ليس الحفظ ]
userSchema.post("init", (doc) => {
  handleUploadImg(doc);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
