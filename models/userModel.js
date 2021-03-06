const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
 
  firstName: {
    type: String,
    trim: true,
    required: "First name is required",
  },

  lastName: {
    type: String,
    trim: true,
    required: "Last name is required",
  },

  username: {
    type: String,
    trim: true,
    unique: true,
    required: "Username is Required",
  },

  email: {
    type: String,
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid e-mail address"],
  },

  password: {
    type: String,
    trim: true,
    required: "Password is Required",
    validate: [({ length }) => length >= 6, "Password should be longer."],
  },

  created: {
    type: Date,
    default: Date.now,
  },

  interests: {
    type: [String],
    // Interest will be selected by user only after sign-up, also it will contain id from interest model not the text.
    // default:["Comic", "Cosplay", "Video Games", "Anime"]
  },

  followers: {
    type: [String],
  },
   savedPosts :{
     type :[mongoose.Schema.Types.ObjectId],
     ref : "Content",
     default : []
   }
});


UserSchema.statics.findByCredentials = async (userId, password)=>{
  const user = await User.findOne({username:userId})
  
  if(!user){
    throw new Error("unable to login")
  }
  else {
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      throw new Error ("Unable to login")
    }

    return user;
  }
 
}


UserSchema.pre("save", async function (next) {
  console.log("before saving");
  //During signup interest and followers should be blank and password is hashed
  this.interests = [];
  this.followers = [];
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

UserSchema.methods.generateAuthToken = async function(){
  const token = jwt.sign({ _id: this._id.toString() }, 'shhhhh');
  return token;
}
UserSchema.methods.toJSON = function(){
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
}
const User = mongoose.model("User", UserSchema);

module.exports = User;
