import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando simulação de Trends...')

  // 1. Criar Utilizador e Perfil
  const user = await prisma.user.upsert({
    where: { email: 'tester@trends.com' },
    update: {},
    create: {
      email: 'tester@trends.com',
      password_hash: 'ignore',
      profile: {
        create: {
            full_name: 'Tester Trends',
            avatar_url: 'https://github.com/shadcn.png'
        }
      }
    },
    include: { profile: true }
  })

  const profileId = user.id

  // 2. Criar uma Pesquisa Ativa
  console.log('📝 Criando pesquisa...')
  const survey = await prisma.survey.create({
    data: {
      title: 'Pesquisa de Tendências ' + new Date().toISOString(),
      description: 'Pesquisa gerada automaticamente para teste de trends',
      status: 'active',
      created_by_id: profileId,
      
      // ATENÇÃO: É 'question' (singular)
      question: { 
        create: [
          {
            // CORREÇÃO FINAL: O campo correto é 'question_text'
            question_text: 'Qual a probabilidade de recomendar?', 
            question_type: 'nps',
            is_required: true,
            order_index: 1 
          }
        ]
      }
    },
    include: { 
        question: true 
    }
  })
  
  // Apanhar o ID da pergunta criada
  const npsQuestionId = survey.question[0].id

  // --- FUNÇÃO AUXILIAR PARA CRIAR RESPOSTAS ---
  const createResponse = async (date: Date, score: number) => {
    await prisma.responseSession.create({
      data: {
        survey_id: survey.id,
        is_complete: true,
        started_at: date,
        completed_at: date, 
        time_spent_seconds: 60,
        responses: {
          create: {
            question_id: npsQuestionId,
            numeric_response: score,
            text_response: null
          }
        }
      }
    })
  }

  // --- PERÍODO ANTERIOR (10 dias atrás) ---
  console.log('⏳ Inserindo 5 respostas más (semana passada)...')
  const prevDate = new Date()
  prevDate.setDate(prevDate.getDate() - 10) 

  for (let i = 0; i < 5; i++) {
    await createResponse(prevDate, 5) // Nota 5 (Detrator)
  }

  // --- PERÍODO ATUAL (Hoje) ---
  console.log('🚀 Inserindo 10 respostas excelentes (esta semana)...')
  const currDate = new Date() 

  for (let i = 0; i < 10; i++) {
    await createResponse(currDate, 10) // Nota 10 (Promotor)
  }

  // Atualizar as métricas (Fake update para o dashboard ler algo imediato)
  await prisma.surveyMetrics.upsert({
    where: { survey_id: survey.id },
    update: {
        total_responses: 15,
        nps_score: 33, 
        updated_at: new Date()
    },
    create: {
        survey_id: survey.id,
        total_responses: 15,
        nps_score: 33,
        completed_responses: 15,
        nps_promoters: 10,
        nps_detractors: 5,
        nps_passives: 0,
        average_rating: 0,
        completion_rate: 100
    }
  })

  console.log('✅ Simulação concluída com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })