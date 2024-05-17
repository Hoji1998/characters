import mongoose from "mongoose";

const ItemStatSchema = new mongoose.Schema(
    {
        health: { type: Number },
        power: { type: Number },
    }
);

const ItemSchema = new mongoose.Schema({
    item_code: { type: Number },
    item_name: { type: String, required: true },
    item_stat: { type: ItemStatSchema },
});

// TodoSchema를 바탕으로 Todo모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model("Items", ItemSchema);
