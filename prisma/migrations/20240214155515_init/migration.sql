/*
  Warnings:

  - You are about to drop the column `tags` on the `Event` table. All the data in the column will be lost.
  - Added the required column `address` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "tags",
ADD COLUMN     "address" TEXT NOT NULL;
