import { ResourceNotFoundError } from "@/use-cases/erros/resource-not-found-error";
import { makeGetSurveyUseCase } from "@/use-cases/factories/make-get-survey-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function get(request: FastifyRequest, reply: FastifyReply) {

    const getSurveyParamsSchema = z.object({
        id: z.uuid()
    })

    const { id } = getSurveyParamsSchema.parse(request.params)

    const getSurveyUseCase = makeGetSurveyUseCase()

    try {

        const { survey } = await getSurveyUseCase.execute({
            surveyId: id
        })
        return reply.status(200).send({
            survey
        })
    } catch (error) {
        if (error instanceof ResourceNotFoundError) {
            return reply.status(400).send({ message: 'Survey not found.' })
        }
        throw error
    }

}