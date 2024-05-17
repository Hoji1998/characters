import express from "express";
import Item from "../schemas/items.schema.js";
import joi from "joi";

const router = express.Router();

//아이템 입력시 유효성 검사, 옵션을 주고 싶었으나 해결하지 못함 => 현재 3가지 값을 전부 알맞게 넣어야 작동
const createdItemSchema = joi.object({
    item_code: joi.number().optional(),
    item_name: joi.string().min(1).max(50).required(),
    item_stat: joi.optional(),
});

router.post("/items", async (req, res, next) => {
    try {
        const validation = await createdItemSchema.validateAsync(req.body);

        const { item_name } = validation;
        const { item_code, item_stat } = req.body;

        let NewItem_Id = item_code;

        // item_code가 없다면 가장 높은 값의 1을 더한 값을 넣는다. 아무 값  없다면 1을 넣는다
        if (!NewItem_Id) {
            const ItemIdMaxOrder = await Item.findOne()
                .sort("-item_code")
                .exec(); //내림 차순 조회

            NewItem_Id = ItemIdMaxOrder ? ItemIdMaxOrder.item_code + 1 : 1;
        }

        //체력이나 힘을 입력받지 못했다면 0을 넣는다.
        const ItemHealth = item_stat.health ? item_stat.health : 0;
        const ItemPower = item_stat.power ? item_stat.power : 0;

        const item = new Item({
            item_code: NewItem_Id,
            item_name: item_name,
            item_stat: { health: ItemHealth, power: ItemPower },
        });

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

//전체목록 조회
router.get("/items", async (req, res, next) => {
    try {
        const items = await Item.find()
            .select("item_code item_name -_id")
            .sort("-item_code")
            .lean() // 불필요한 메타데이터 제거
            .exec();

        return res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

//상세목록 조회
router.get("/items/:item_code", async (req, res, next) => {
    try {
        const { item_code } = req.params;

        const currentItem = await Item.findOne({ item_code }).exec();

        // 구조 분해 할당을 해서 원본 데이터는 살리고 _id는 제외한다.
        const { _id, ...itemStat } = currentItem.item_stat._doc;

        return res.status(200).json({
            item_code: currentItem.item_code,
            item_name: currentItem.item_name,
            item_stat: itemStat,
        });
    } catch (error) {
        next(error);
    }
});

//수정
router.patch("/items/:item_code", async (req, res, next) => {
    try {
        // 변경할 item_code를 가져온다
        const { item_code } = req.params;
        const { item_name, item_stat } = req.body;

        const currentItem = await Item.findOne({ item_code }).exec();

        if (item_name) {
            currentItem.item_name = item_name;
        }

        currentItem.health = item_stat.health ? item_stat.health : 0;
        currentItem.power = item_stat.power ? item_stat.power : 0;

        await currentItem.save();

        return res.status(200).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
