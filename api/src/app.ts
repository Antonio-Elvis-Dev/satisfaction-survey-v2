import fastify from "fastify"
import { z, ZodError } from "zod"
import { env } from "./env"
import fastifyJwt from "@fastify/jwt"
import fastifyCors from "@fastify/cors"
import fastifyCookie from "@fastify/cookie"
import { usersRoutes } from "./http/controllers/users/routes"
import { surveysRoutes } from "./http/controllers/surveys/routes"
import { dashboardRoutes } from "./http/controllers/dashboard/routes"

export const app = fastify()



app.register(fastifyCors, {
  origin: true, // Em produção, deves colocar a URL exata do frontend (ex: 'http://localhost:5173')
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Permite envio de cookies se necessário
})
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  // sign: {
  //   expiresIn: '10m',
  // },
})

app.register(fastifyCookie)
app.register(dashboardRoutes)
app.register(usersRoutes)
app.register(surveysRoutes)

app.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
        return reply
        .status(400)
        .send({
            message: "Validation error.",
            issues: error.format()
        })
    }

    if (env.NODE_ENV !== "production") {
        console.error(error)
    } else {
        // Here you can integrate with an external service like Sentry/Datadog/NewRelic
        // to log errors in production environment
    }

    return reply.status(500).send({
        message: "Internal server error."
    })
})