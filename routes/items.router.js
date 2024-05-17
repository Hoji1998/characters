// /routes/todos.router.js
import express from "express";
import Item from "../schemas/items.schema.js";
import joi from "joi";

const router = express.Router();

const createdItemSchema = joi.object({
    item_code: joi.number().optional(),
    item_name: joi.string().min(1).max(50).required(),
    item_stat: joi.optional(),
});

// const deletedCharacterSchema = joi.object({
//     character_Id: joi.string().trim().min(1).required(),
// });
// async를 사용하지 않으면 데이터베이스에서 조회 불가 (비동기적으로 처리하기 위해)
router.post("/items", async (req, res, next) => {
    try {
        // // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
        const validation = await createdItemSchema.validateAsync(req.body);

        const { item_name } = validation;
        const { item_code, item_stat } = req.body;

        // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
        // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        let NewItem_Id = item_code;

        if (!NewItem_Id) {
            const ItemIdMaxOrder = await Item.findOne()
                .sort("-item_code")
                .exec(); //내림 차순 조회

            NewItem_Id = ItemIdMaxOrder ? ItemIdMaxOrder.item_code + 1 : 1;
        }

        const ItemHealth = item_stat.health ? item_stat.health : 0;
        const ItemPower = item_stat.power ? item_stat.power : 0;
        // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.

        const item = new Item({
            item_code: NewItem_Id,
            item_name: item_name,
            item_stat: { health: ItemHealth, power: ItemPower },
        });

        // 생성한 '해야할 일'을 MongoDB에 저장합니다.
        await item.save();
        return res.status(201).json({
            message: `새로운 아이템'${item_name}}'를 생성하셨습니다!`,
            data: { item_code: NewItem_Id },
        });
    } catch (error) {
        // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
        next(error);
    }
});
//해야할 일 목록 조회 API
router.get("/items", async (req, res) => {
    // 1. 해야할 일 목록 조회를 진행한다.
    const items = await Item.find()
        .select("item_code item_name -_id")
        .sort("-item_code")
        .lean() // 불필요한 메타데이터 제거
        .exec();

    // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
    return res.status(200).json(items);
});
//해야할 일 목록 조회 API
router.get("/items/:item_code", async (req, res) => {
    // 1. 해야할 일 목록 조회를 진행한다.
    const { item_code } = req.params;

    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const currentItem = await Item.findOne({ item_code }).exec();

    if (!currentItem) {
        return res.status(404).json();
    }
    const { _id, ...itemStat } = currentItem.item_stat._doc;
    // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
    return res.status(200).json({
        item_code: currentItem.item_code,
        item_name: currentItem.item_name,
        item_stat: itemStat,
    });
});

// 해야할 일 순서 변경, 완료 / 해제 API
router.patch("/items/:item_code", async (req, res) => {
    // 변경할 '해야할 일'의 ID 값을 가져옵니다.
    const { item_code } = req.params;
    // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다.
    const { item_name, item_stat } = req.body;

    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const currentItem = await Item.findOne({ item_code }).exec();
    if (!currentItem) {
        return res.status(404).json();
    }

    if (item_name) {
        currentItem.item_name = item_name;
    }

    currentItem.health = item_stat.health ? item_stat.health : 0;
    currentItem.power = item_stat.power ? item_stat.power : 0;

    // 변경된 '해야할 일'을 저장합니다.
    await currentItem.save();

    return res.status(200).json({});
});

export default router;
