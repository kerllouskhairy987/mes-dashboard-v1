const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    unique: true,
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
  role: {
    type: String,
    enum: ["user", "admin", "manager"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// mongoose middleware
const handleUploadImg = (doc) => {
  if (doc.profileImg) {
    doc.profileImg = `${process.env.BASE_URL}/users/${doc.profileImg}`;
  }
};
// findOne, findMany, update
userSchema.post("init", (doc) => {
  handleUploadImg(doc);
});

// create
userSchema.post("save", (doc) => {
  handleUploadImg(doc);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
