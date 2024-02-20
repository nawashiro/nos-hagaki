/*
  Warnings:

  - You are about to drop the `Posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Posts";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "submittedDataId" INTEGER NOT NULL,
    "kind" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL,
    "tags" JSONB NOT NULL,
    "sig" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedData" (
    "id" SERIAL NOT NULL,
    "sended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendDay" TIMESTAMP(3) NOT NULL,
    "relays" TEXT[],
    "ip" TEXT NOT NULL,

    CONSTRAINT "SubmittedData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_submittedDataId_key" ON "Event"("submittedDataId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_submittedDataId_fkey" FOREIGN KEY ("submittedDataId") REFERENCES "SubmittedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
