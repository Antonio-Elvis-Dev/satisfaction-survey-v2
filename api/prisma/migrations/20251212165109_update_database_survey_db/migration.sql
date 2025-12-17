/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `optionText` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `question_options` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `isRequired` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `maxLength` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `maxRating` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `minRating` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `questionText` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `questionType` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `surveyId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `isComplete` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `respondentId` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `respondentIp` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `respondentUserAgent` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `surveyId` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpentSeconds` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `answeredAt` on the `responses` table. All the data in the column will be lost.
  - You are about to drop the column `numericResponse` on the `responses` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `responses` table. All the data in the column will be lost.
  - You are about to drop the column `selectedOptionalId` on the `responses` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `responses` table. All the data in the column will be lost.
  - You are about to drop the column `textResponse` on the `responses` table. All the data in the column will be lost.
  - The primary key for the `survey_metrics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `averageCompletionTimeSeconds` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `averageRating` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `completedResponses` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `completionRate` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `csatScore` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `lastCalculatedAt` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `npsDetractors` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `npsPassives` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `npsPromoters` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `npsScore` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `surveyId` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `totalResponses` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `survey_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `allowAnonymous` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `closedAt` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `duplicatedFromId` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `isTemplate` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `showProgressBar` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `thankYouMessage` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `totalResponses` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `users_roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[question_id,order_index]` on the table `question_options` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[survey_id,order_index]` on the table `questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_id,question_id]` on the table `responses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `option_text` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_index` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `question_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_index` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_text` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_type` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `survey_id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `survey_id` to the `response_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `responses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_id` to the `responses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `survey_id` to the `survey_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `survey_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `surveys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `surveys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."question_options" DROP CONSTRAINT "question_options_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."questions" DROP CONSTRAINT "questions_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."response_sessions" DROP CONSTRAINT "response_sessions_respondentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."response_sessions" DROP CONSTRAINT "response_sessions_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."responses" DROP CONSTRAINT "responses_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."responses" DROP CONSTRAINT "responses_selectedOptionalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."responses" DROP CONSTRAINT "responses_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."survey_metrics" DROP CONSTRAINT "survey_metrics_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."surveys" DROP CONSTRAINT "surveys_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."surveys" DROP CONSTRAINT "surveys_duplicatedFromId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users_roles" DROP CONSTRAINT "users_roles_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."users_roles" DROP CONSTRAINT "users_roles_userId_fkey";

-- DropIndex
DROP INDEX "public"."question_options_questionId_idx";

-- DropIndex
DROP INDEX "public"."question_options_questionId_orderIndex_key";

-- DropIndex
DROP INDEX "public"."questions_surveyId_orderIndex_idx";

-- DropIndex
DROP INDEX "public"."questions_surveyId_orderIndex_key";

-- DropIndex
DROP INDEX "public"."response_sessions_respondentId_idx";

-- DropIndex
DROP INDEX "public"."response_sessions_surveyId_idx";

-- DropIndex
DROP INDEX "public"."response_sessions_surveyId_isComplete_idx";

-- DropIndex
DROP INDEX "public"."responses_questionId_idx";

-- DropIndex
DROP INDEX "public"."responses_sessionId_idx";

-- DropIndex
DROP INDEX "public"."responses_sessionId_questionId_key";

-- DropIndex
DROP INDEX "public"."surveys_createdAt_idx";

-- DropIndex
DROP INDEX "public"."surveys_createdById_idx";

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "avatarUrl",
DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."question_options" DROP COLUMN "createdAt",
DROP COLUMN "optionText",
DROP COLUMN "orderIndex",
DROP COLUMN "questionId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "option_text" TEXT NOT NULL,
ADD COLUMN     "order_index" INTEGER NOT NULL,
ADD COLUMN     "question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."questions" DROP COLUMN "createdAt",
DROP COLUMN "isRequired",
DROP COLUMN "maxLength",
DROP COLUMN "maxRating",
DROP COLUMN "minRating",
DROP COLUMN "orderIndex",
DROP COLUMN "questionText",
DROP COLUMN "questionType",
DROP COLUMN "surveyId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_length" INTEGER,
ADD COLUMN     "max_rating" INTEGER DEFAULT 5,
ADD COLUMN     "min_rating" INTEGER DEFAULT 1,
ADD COLUMN     "order_index" INTEGER NOT NULL,
ADD COLUMN     "question_text" TEXT NOT NULL,
ADD COLUMN     "question_type" "public"."QuestionType" NOT NULL,
ADD COLUMN     "survey_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."response_sessions" DROP COLUMN "completedAt",
DROP COLUMN "isComplete",
DROP COLUMN "respondentId",
DROP COLUMN "respondentIp",
DROP COLUMN "respondentUserAgent",
DROP COLUMN "startedAt",
DROP COLUMN "surveyId",
DROP COLUMN "timeSpentSeconds",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "is_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "respondent_id" TEXT,
ADD COLUMN     "respondent_ip" TEXT,
ADD COLUMN     "respondent_user_agent" TEXT,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "survey_id" TEXT NOT NULL,
ADD COLUMN     "time_spent_seconds" INTEGER,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."responses" DROP COLUMN "answeredAt",
DROP COLUMN "numericResponse",
DROP COLUMN "questionId",
DROP COLUMN "selectedOptionalId",
DROP COLUMN "sessionId",
DROP COLUMN "textResponse",
ADD COLUMN     "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "numeric_response" INTEGER,
ADD COLUMN     "question_id" TEXT NOT NULL,
ADD COLUMN     "selected_option_id" TEXT,
ADD COLUMN     "session_id" TEXT NOT NULL,
ADD COLUMN     "text_response" TEXT;

-- AlterTable
ALTER TABLE "public"."survey_metrics" DROP CONSTRAINT "survey_metrics_pkey",
DROP COLUMN "averageCompletionTimeSeconds",
DROP COLUMN "averageRating",
DROP COLUMN "completedResponses",
DROP COLUMN "completionRate",
DROP COLUMN "csatScore",
DROP COLUMN "lastCalculatedAt",
DROP COLUMN "npsDetractors",
DROP COLUMN "npsPassives",
DROP COLUMN "npsPromoters",
DROP COLUMN "npsScore",
DROP COLUMN "surveyId",
DROP COLUMN "totalResponses",
DROP COLUMN "updatedAt",
ADD COLUMN     "average_completion_time_seconds" INTEGER,
ADD COLUMN     "average_rating" DECIMAL(3,2),
ADD COLUMN     "completed_responses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completion_rate" DECIMAL(5,2),
ADD COLUMN     "csat_score" DECIMAL(5,2),
ADD COLUMN     "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nps_detractors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nps_passives" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nps_promoters" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nps_score" INTEGER,
ADD COLUMN     "survey_id" TEXT NOT NULL,
ADD COLUMN     "total_responses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "survey_metrics_pkey" PRIMARY KEY ("survey_id");

-- AlterTable
ALTER TABLE "public"."surveys" DROP COLUMN "allowAnonymous",
DROP COLUMN "closedAt",
DROP COLUMN "createdAt",
DROP COLUMN "createdById",
DROP COLUMN "duplicatedFromId",
DROP COLUMN "isTemplate",
DROP COLUMN "publishedAt",
DROP COLUMN "showProgressBar",
DROP COLUMN "thankYouMessage",
DROP COLUMN "totalResponses",
DROP COLUMN "updatedAt",
ADD COLUMN     "allow_anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_id" TEXT NOT NULL,
ADD COLUMN     "duplicated_from_id" TEXT,
ADD COLUMN     "is_template" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "show_progress_bar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "thank_you_message" TEXT NOT NULL DEFAULT 'Obrigado por participar!',
ADD COLUMN     "total_responses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "createdAt",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."users_roles";

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."AppRole" NOT NULL DEFAULT 'viewer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "public"."user_roles"("user_id", "role");

-- CreateIndex
CREATE INDEX "question_options_question_id_idx" ON "public"."question_options"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_question_id_order_index_key" ON "public"."question_options"("question_id", "order_index");

-- CreateIndex
CREATE INDEX "questions_survey_id_order_index_idx" ON "public"."questions"("survey_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "questions_survey_id_order_index_key" ON "public"."questions"("survey_id", "order_index");

-- CreateIndex
CREATE INDEX "response_sessions_survey_id_idx" ON "public"."response_sessions"("survey_id");

-- CreateIndex
CREATE INDEX "response_sessions_respondent_id_idx" ON "public"."response_sessions"("respondent_id");

-- CreateIndex
CREATE INDEX "response_sessions_survey_id_is_complete_idx" ON "public"."response_sessions"("survey_id", "is_complete");

-- CreateIndex
CREATE INDEX "responses_session_id_idx" ON "public"."responses"("session_id");

-- CreateIndex
CREATE INDEX "responses_question_id_idx" ON "public"."responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "responses_session_id_question_id_key" ON "public"."responses"("session_id", "question_id");

-- CreateIndex
CREATE INDEX "surveys_created_by_id_idx" ON "public"."surveys"("created_by_id");

-- CreateIndex
CREATE INDEX "surveys_created_at_idx" ON "public"."surveys"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_duplicated_from_id_fkey" FOREIGN KEY ("duplicated_from_id") REFERENCES "public"."surveys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_sessions" ADD CONSTRAINT "response_sessions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_sessions" ADD CONSTRAINT "response_sessions_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_sessions" ADD CONSTRAINT "response_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."response_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."responses" ADD CONSTRAINT "responses_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_metrics" ADD CONSTRAINT "survey_metrics_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
