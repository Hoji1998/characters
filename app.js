import express from "express";
import connet from "./schemas/index.js";
import charactersRouter from "./routes/characters.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

connet();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json()); // 미들웨어 1
app.use(express.urlencoded({ extended: true })); // 미들웨어 2

app.use(express.static("./assets")); // 미들웨어 3

// 미들웨어 4
app.use((req, res, next) => {
    console.log("Request URL:", req.originalUrl, " - ", new Date());
    next();
});

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({ message: "Hi!" });
});

app.use("/api", [router, charactersRouter]); // 미들웨어 5

// 에러 처리 미들웨어를 등록한다. => 라우터 다음
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(PORT, "포트로 서버가 열렸어요!");
});
