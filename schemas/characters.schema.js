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

// TodoSchema를 바탕으로 Todo모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model("Characters", CharacterSchema);
