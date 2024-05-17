// /routes/todos.router.js
import express from "express";
import Character from "../schemas/characters.schema.js";
import joi from "joi";

const router = express.Router();

const createdCharacterSchema = joi.object({
    name: joi.string().min(1).max(50).required(),
    health: joi.number().optional(),
    power: joi.number().optional(),
});

const deletedCharacterSchema = joi.object({
    character_Id: joi.string().trim().min(1).required(),
});

// routes/todos.router.js
// 할일 등록 API

// async를 사용하지 않으면 데이터베이스에서 조회 불가 (비동기적으로 처리하기 위해)
router.post("/characters", async (req, res, next) => {
    try {
        // // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
        const validation = await createdCharacterSchema.validateAsync(req.body);

        const { name } = validation;
        const { health, power } = req.body;

        // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
        const CharacterIdMaxOrder = await Character.findOne()
            .sort("-character_Id")
            .exec(); //내림 차순 조회

        // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        const NewCharacter_Id = CharacterIdMaxOrder
            ? CharacterIdMaxOrder.character_Id + 1
            : 1;

        const CharacterHealth = health ? health : 500;
        const CharacterPower = power ? power : 100;
        // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.

        const character = new Character({
            character_Id: NewCharacter_Id,
            name: name,
            health: CharacterHealth,
            power: CharacterPower,
        });

        // 생성한 '해야할 일'을 MongoDB에 저장합니다.
        await character.save();
        return res.status(201).json({
            message: `새로운 캐릭터'${name}'를 생성하셨습니다!`,
            data: { character_Id: NewCharacter_Id },
        });
    } catch (error) {
        // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
        next(error);
    }
});

//해야할 일 목록 조회 API
router.get("/characters/:character_Id", async (req, res) => {
    // 1. 해야할 일 목록 조회를 진행한다.
    const { character_Id } = req.params;

    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const currentCharacter = await Character.findOne({ character_Id }).exec();
    if (!currentCharacter) {
        return res.status(404).json();
    }

    // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
    return res
        .status(200)
        .json({
            name: currentCharacter.name,
            health: currentCharacter.health,
            power: currentCharacter.power,
        });
});

/** 할 일 삭제 **/
router.delete("/characters/:character_Id", async (req, res, next) => {
    try {
        const newcharacter_Id = req.params.character_Id;
        if (!newcharacter_Id || (newcharacter_Id && !newcharacter_Id.trim())) {
            return res
                .status(400)
                .json({ errorMessage: "캐릭터 ID를 입력하세요." });
        }
        // 입력값이 없는 경우에는 400 상태 코드를 반환합니다.

        // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
        const validation = await deletedCharacterSchema.validateAsync(
            req.params,
        );
        const { character_Id } = validation;
        // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
        const character = await Character.findOne({ character_Id }).exec();
        if (!character) {
            console.log("?");
            return res.status(404).json({ error: "404 오류 남!" });
        }

        const deletedName = character.name;
        // 조회된 '해야할 일'을 삭제합니다.
        await Character.deleteOne({ character_Id: character_Id }).exec();

        return res
            .status(200)
            .json({ message: `캐릭터'${deletedName}'를 삭제하였습니다.` });
    } catch (error) {
        console.log("catch");
        next(error);
    }
});
export default router;
