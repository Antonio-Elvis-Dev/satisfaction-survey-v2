import { FastifyInstance } from "fastify";
import { create } from "./create";
import { verifyJWT } from "../middlewares/verify-jwt";
import { fetch } from "./fetch";
import { get } from "./get";
import { submit } from "./submit";



export async function surveysRoutes(app: FastifyInstance) {

    app.post('/surveys', { onRequest: [verifyJWT] }, create)
    app.get('/surveys', { onRequest: [verifyJWT] }, fetch)
    app.get('/public/survey/:id', get)
    app.get('/public/survey/:id/responses', submit)

}