export default (error, req, res, next) => {
    if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    if (error.status) { //404
        return res.status(error.status).json({ message: '캐릭터 조회에 실패하였습니다.' });
    }

    return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생했습니다." });
};
