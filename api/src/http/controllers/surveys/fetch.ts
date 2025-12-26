import { makeFetchSurveyUseCase } from "@/use-cases/factories/make-fetch-survey-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function fetch(request: FastifyRequest, reply: FastifyReply) {

    const fetchSurveyUseCase = makeFetchSurveyUseCase()
    const { surveys } = await fetchSurveyUseCase.execute()

    return reply.status(200).send({
        surveys
    })
}