const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Question",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", answerSchema);
