import { FastifyInstance } from "fastify";
import { verifyJWT } from "../middlewares/verify-jwt";
import { stats } from "./stats";


export async function dashboardRoutes(app: FastifyInstance) {

    app.get('/dashboard/stats',{ onRequest: [verifyJWT] }, stats)
}