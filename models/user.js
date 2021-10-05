const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
    name: {
        type: String,
        required: true,
      },
    branch: {
        type: String,
        required: true,
      },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
