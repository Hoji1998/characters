import express from "express";
import Character from "../schemas/characters.schema.js";
import joi from "joi";

const router = express.Router();

// joi를 사용하여 유효성 검사를 한다.
const createdCharacterSchema = joi.object({
    name: joi.string().min(1).max(50).required(),
    health: joi.number().optional(),
    power: joi.number().optional(),
});

// 삭제를 위한 유효성 검사
const deletedCharacterSchema = joi.object({
    character_Id: joi.string().trim().min(1).required(),
});

router.post("/characters", async (req, res, next) => {
    try {
        const validation = await createdCharacterSchema.validateAsync(req.body);

        const { name } = validation;
        const { health, power } = req.body;
        const CharacterIdMaxOrder = await Character.findOne()
            .sort("-character_Id")
            .exec(); //내림 차순 조회

        // 'character_Id' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        const NewCharacter_Id = CharacterIdMaxOrder
            ? CharacterIdMaxOrder.character_Id + 1
            : 1;

        const CharacterHealth = health ? health : 500;
        const CharacterPower = power ? power : 100;
        // 입력받은 값없다면 기본값을 넣는다. 체력 : 500, 힘 : 100

        const character = new Character({
            character_Id: NewCharacter_Id,
            name: name,
            health: CharacterHealth,
            power: CharacterPower,
        });

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

//상세 목록 조회
router.get("/characters/:character_Id", async (req, res, next) => {
    try {
        const { character_Id } = req.params;

        const currentCharacter = await Character.findOne({
            character_Id,
        }).exec();

        // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
        return res.status(200).json({
            name: currentCharacter.name,
            health: currentCharacter.health,
            power: currentCharacter.power,
        });
    } catch (error) {
        next(error);
    }
});

// 캐릭터 삭제
router.delete("/characters/:character_Id", async (req, res, next) => {
    try {
        // 공백 검사 => 현재 해결 못함
        const newcharacter_Id = req.params.character_Id;
        if (!newcharacter_Id || (newcharacter_Id && !newcharacter_Id.trim())) {
            return res
                .status(400)
                .json({ errorMessage: "캐릭터 ID를 입력하세요." });
        }
        // 입력값이 없는 경우에는 400 상태 코드를 반환합니다.

        const validation = await deletedCharacterSchema.validateAsync(
            req.params,
        );
        const { character_Id } = validation;

        const character = await Character.findOne({ character_Id }).exec();

        // 오류 발생시 catch를 하지 못하는 문제(공백 입력시)를 테스트하기 위해 직접 return 함
        if (!character) {
            console.log("?");
            return res.status(404).json({ error: "404 오류 남!" });
        }

        const deletedName = character.name;
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
