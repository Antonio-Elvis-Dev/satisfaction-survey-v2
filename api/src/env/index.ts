import 'dotenv/config'

import { z } from 'zod'


const envSchema = z.object({
    NODE_ENV: z.enum(['dev','test','production']).default('dev'),
    JWT_SECRET:z.string(),
    PORT:z.coerce.number().default(3333),
    OPENAI_API_KEY:z.string(),
    GEMINI_API_KEY:z.string(),
    GROQ_API_KEY:z.string()
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false){
    console.error('❌ Invalid environment variables', _env.error.flatten())

    throw new Error('Invalid environment variables.')
}


export const env =_env.data