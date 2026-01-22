import { FastifyInstance } from "fastify";
import { register } from "./register";
import { authenticate } from "./authenticate";
import { verifyJWT } from "../middlewares/verify-jwt";
import { updateProfile } from "./update-profile";


export async function usersRoutes(app: FastifyInstance) {

    app.post('/users', register)
    app.post('/sessions', authenticate)
    app.put('/me', { onRequest: [verifyJWT] }, updateProfile)
}