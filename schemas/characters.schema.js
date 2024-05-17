import mongoose from "mongoose";

const CharacterSchema = new mongoose.Schema({
    character_Id: {
        type: Number,
    },
    name: {
        type: String,
        required: true, // name 필드는 필수 요소입니다.
    },
    health: {
        type: Number, 
    },
    power: {
        type: Number,
    },
});

// CharacterSchema 바탕으로 Characters모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model("Characters", CharacterSchema);
