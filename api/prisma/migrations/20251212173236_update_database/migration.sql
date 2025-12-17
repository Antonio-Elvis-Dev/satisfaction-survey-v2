/*
  Warnings:

  - You are about to drop the column `respondent_ip` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `response_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `surveys` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."response_sessions" DROP CONSTRAINT "response_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."surveys" DROP CONSTRAINT "surveys_userId_fkey";

-- AlterTable
ALTER TABLE "public"."response_sessions" DROP COLUMN "respondent_ip",
DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "public"."surveys" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."response_sessions" ADD CONSTRAINT "response_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
