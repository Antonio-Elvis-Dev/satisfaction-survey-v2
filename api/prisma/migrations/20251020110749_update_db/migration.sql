/*
  Warnings:

  - You are about to drop the `response_session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."question_options" DROP CONSTRAINT "question_options_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions" DROP CONSTRAINT "questions_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."response_session" DROP CONSTRAINT "response_session_respondentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."response_session" DROP CONSTRAINT "response_session_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."responses" DROP CONSTRAINT "responses_selectedOptionalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."responses" DROP CONSTRAINT "responses_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."surveys" DROP CONSTRAINT "surveys_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."users_roles" DROP CONSTRAINT "users_roles_userId_fkey";

-- DropTable
DROP TABLE "public"."response_session";

-- CreateTable
CREATE TABLE "public"."response_sessions" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "respondentIp" TEXT,
    "respondentUserAgent" TEXT,
    "timeSpentSeconds" INTEGER,

    CONSTRAINT "response_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "response_sessions_surveyId_idx" ON "public"."response_sessions"("surveyId");

-- CreateIndex
CREATE INDEX "response_sessions_respondentId_idx" ON "public"."response_sessions"("respondentId");

-- CreateIndex
CREATE INDEX "response_sessions_surveyId_isComplete_idx" ON "public"."response_sessions"("surveyId", "isComplete");

-- AddForeignKey
ALTER TABLE "public"."users_roles" ADD CONSTRAINT "users_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_sessions" ADD CONSTRAINT "response_sessions_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_sessions" ADD CONSTRAINT "response_sessions_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."response_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_selectedOptionalId_fkey" FOREIGN KEY ("selectedOptionalId") REFERENCES "public"."question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
