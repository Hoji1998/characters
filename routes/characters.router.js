// /routes/todos.router.js
import express from "express";
import Character from "../schemas/characters.schema.js";
import joi from "joi";

const router = express.Router();

const createdCharacterSchema = joi.object({
    name: joi.string().min(1).max(50).required(),
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

        // 만약 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메시지를 전달한다.
        if (!name) {
            return res.status(400).json({
                errorMessage: "해야할 일 (value) 데이터가 존재하지 않습니다.",
            });
        }
        // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
        const CharacterIdMaxOrder = await Character.findOne()
            .sort("-character_Id")
            .exec(); //내림 차순 조회

        // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        const NewCharacter_Id = CharacterIdMaxOrder === NaN
            ? CharacterIdMaxOrder.character_Id + 1
            : 1;

        const CharacterHealth = health ? health : 500;
        const CharacterPower = power ? power : 100;
        // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
        console.log(
            `${CharacterHealth} // ${CharacterPower} // ${NewCharacter_Id}`,
        );
        const character = new Character({
            character_Id: NewCharacter_Id,
            name: name,
            health: CharacterHealth,
            power: CharacterPower,
        });

        // 생성한 '해야할 일'을 MongoDB에 저장합니다.
        await character.save();

        return res.status(201).json({ character });
    } catch (error) {
        // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
        next(error);
    }
});

//해야할 일 목록 조회 API
router.get("/characters", async (req, res) => {
    // 1. 해야할 일 목록 조회를 진행한다.
    const characters = await Character.find().sort("-character_Id").exec();

    // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
    return res.status(200).json({ characters });
});

// 해야할 일 순서 변경, 완료 / 해제 API
router.patch("/characters/:character_Id", async (req, res) => {
    // 변경할 '해야할 일'의 ID 값을 가져옵니다.
    const { character_Id } = req.params;
    // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다.
    const { health, power, name } = req.body;

    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const currentCharacter = await Character.findOne({ character_Id }).exec();
    if (!currentCharacter) {
        return res
            .status(404)
            .json({ errorMessage: "존재하지 않는 character 데이터입니다." });
    }

    // if (character_Id) {
    //     // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
    //     const targetCharacter = await Character.findOne({ character_Id }).exec();
    //     if (targetTodo) {
    //         // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
    //         targetTodo.order = currentTodo.order;
    //         await targetTodo.save();
    //     }
    //     // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    //     currentTodo.order = order;
    // }

    // if (done !== undefined) {
    //     currentTodo.doneAt = done ? new Date() : null;
    // }

    if (name) {
        currentCharacter.name = name;
    }

    if (health) {
        currentCharacter.health = health;
    }

    if (power) {
        currentCharacter.power = power;
    }

    // 변경된 '해야할 일'을 저장합니다.
    await currentCharacter.save();

    return res.status(200).json({});
});

// routes/todos.router.js

/** 할 일 삭제 **/
router.delete("/characters/:character_Id", async (req, res) => {
    // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
    const { character_Id } = req.params;

    // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
    const character = await Character.findOne({ character_Id }).exec();
    if (!character) {
        return res
            .status(404)
            .json({ errorMessage: "존재하지 않는 character 데이터입니다." });
    }

    // 조회된 '해야할 일'을 삭제합니다.
    await Character.deleteOne({ character_Id: character_Id }).exec();

    return res.status(200).json({});
});

export default router;
