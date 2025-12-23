import { FastifyInstance } from "fastify";
import { create } from "./create";
import { verifyJWT } from "../middlewares/verify-jwt";



export async function surveysRoutes(app: FastifyInstance) {

    app.post('/surveys',{onRequest:[verifyJWT]}, create)
   
}