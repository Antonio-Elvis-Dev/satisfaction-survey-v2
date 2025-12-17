-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('short_text', 'long_text', 'multiple_choice', 'rating', 'nps');

-- CreateEnum
CREATE TYPE "public"."SurveyStatus" AS ENUM ('draft', 'active', 'paused', 'completed');

-- CreateEnum
CREATE TYPE "public"."AppRole" AS ENUM ('admin', 'manager', 'viewer');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."AppRole" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "users_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."surveys" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."SurveyStatus" NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "showProgressBar" BOOLEAN NOT NULL DEFAULT true,
    "thankYouMessage" TEXT NOT NULL DEFAULT 'Obrigado por participar!',
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "duplicatedFromId" TEXT,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "public"."QuestionType" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "minRating" INTEGER DEFAULT 1,
    "maxRating" INTEGER DEFAULT 5,
    "maxLength" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."response_session" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "respondentIp" TEXT,
    "respondentUserAgent" TEXT,
    "timeSpentSeconds" INTEGER,

    CONSTRAINT "response_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textResponse" TEXT,
    "numericResponse" INTEGER,
    "selectedOptionalId" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_metrics" (
    "surveyId" TEXT NOT NULL,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "completedResponses" INTEGER NOT NULL DEFAULT 0,
    "averageCompletionTimeSeconds" INTEGER,
    "completionRate" DECIMAL(5,2),
    "averageRating" DECIMAL(3,2),
    "npsScore" INTEGER,
    "npsPromoters" INTEGER NOT NULL DEFAULT 0,
    "npsPassives" INTEGER NOT NULL DEFAULT 0,
    "npsDetractors" INTEGER NOT NULL DEFAULT 0,
    "csatScore" DECIMAL(5,2),
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_metrics_pkey" PRIMARY KEY ("surveyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_roles_userId_role_key" ON "public"."users_roles"("userId", "role");

-- CreateIndex
CREATE INDEX "surveys_status_idx" ON "public"."surveys"("status");

-- CreateIndex
CREATE INDEX "surveys_createdById_idx" ON "public"."surveys"("createdById");

-- CreateIndex
CREATE INDEX "surveys_createdAt_idx" ON "public"."surveys"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "questions_surveyId_orderIndex_idx" ON "public"."questions"("surveyId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "questions_surveyId_orderIndex_key" ON "public"."questions"("surveyId", "orderIndex");

-- CreateIndex
CREATE INDEX "question_options_questionId_idx" ON "public"."question_options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_questionId_orderIndex_key" ON "public"."question_options"("questionId", "orderIndex");

-- CreateIndex
CREATE INDEX "response_session_surveyId_idx" ON "public"."response_session"("surveyId");

-- CreateIndex
CREATE INDEX "response_session_respondentId_idx" ON "public"."response_session"("respondentId");

-- CreateIndex
CREATE INDEX "response_session_surveyId_isComplete_idx" ON "public"."response_session"("surveyId", "isComplete");

-- CreateIndex
CREATE INDEX "responses_sessionId_idx" ON "public"."responses"("sessionId");

-- CreateIndex
CREATE INDEX "responses_questionId_idx" ON "public"."responses"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "responses_sessionId_questionId_key" ON "public"."responses"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_roles" ADD CONSTRAINT "users_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_roles" ADD CONSTRAINT "users_roles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_duplicatedFromId_fkey" FOREIGN KEY ("duplicatedFromId") REFERENCES "public"."surveys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_session" ADD CONSTRAINT "response_session_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_session" ADD CONSTRAINT "response_session_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."response_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_selectedOptionalId_fkey" FOREIGN KEY ("selectedOptionalId") REFERENCES "public"."question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_metrics" ADD CONSTRAINT "survey_metrics_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
