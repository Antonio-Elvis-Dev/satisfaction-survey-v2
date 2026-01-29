import { FastifyInstance } from "fastify";
import { create } from "./create";
import { verifyJWT } from "../middlewares/verify-jwt";
import { fetch } from "./fetch";
import { get } from "./get";
import { submit } from "./submit";
import { getStats } from "./get-stats";
import { deleteSurvey } from "./delete";
import { analyze } from "./analyze";
import { update } from "./update";
import { updateStatus } from "./update-status";
import { duplicate } from "./duplicate";
import { getAiAnalysis } from "./get-ai-analysis";

export async function surveysRoutes(app: FastifyInstance) {

    app.post('/surveys', { onRequest: [verifyJWT] }, create)
    app.get('/surveys', { onRequest: [verifyJWT] }, fetch)
    app.get('/surveys/:id/stats', { onRequest: [verifyJWT] }, getStats)
    app.delete('/surveys/:id', { onRequest: [verifyJWT] }, deleteSurvey)
    app.get('/public/surveys/:id', get)
    app.post('/public/surveys/:id/responses', submit)
    app.post('/ai/sentiment', { onRequest: [verifyJWT] }, analyze)
    app.put('/surveys/:id', { onRequest: [verifyJWT] }, update)

    app.patch('/surveys/:id/status', { onRequest: [verifyJWT] }, updateStatus)
    app.post('/surveys/:id/duplicate', { onRequest: [verifyJWT] }, duplicate)
    app.post('/surveys/:id/ai-analysis', { onRequest: [verifyJWT] }, getAiAnalysis)
}