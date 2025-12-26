import { FastifyInstance } from "fastify";
import { create } from "./create";
import { verifyJWT } from "../middlewares/verify-jwt";
import { fetch } from "./fetch";
import { get } from "./get";
import { submit } from "./submit";
import { getStats } from "./get-stats";
import { deleteSurvey } from "./delete";



export async function surveysRoutes(app: FastifyInstance) {

    app.post('/surveys', { onRequest: [verifyJWT] }, create)
    app.get('/surveys', { onRequest: [verifyJWT] }, fetch)
    app.get('/surveys/:id/stats', { onRequest: [verifyJWT] }, getStats)
    app.delete('/surveys/:id', { onRequest: [verifyJWT] }, deleteSurvey)
    app.get('/public/surveys/:id', get)
    app.post('/public/surveys/:id/responses', submit)

}