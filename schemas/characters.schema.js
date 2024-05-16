import mongoose from "mongoose";

const CharacterSchema = new mongoose.Schema({
    character_Id: {
        type: Number,
        //required: true, // order 필드 또한 필수 요소입니다.
    },
    name: {
        type: String,
        required: true, // value 필드는 필수 요소입니다.
    },
    health: {
        type: Number, 
        //required: true,
    },
    power: {
        type: Number,
        //required: true, // value 필드는 필수 요소입니다.
    },
});

// // 프론트엔드 서빙을 위한 코드입니다. 모르셔도 괜찮아요!
// CharacterSchema.virtual("todo").get(function () {
//     return this._id.toHexString();
// });
// CharacterSchema.set("toJSON", {
//     virtuals: true,
// });

// TodoSchema를 바탕으로 Todo모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model("Characters", CharacterSchema);
