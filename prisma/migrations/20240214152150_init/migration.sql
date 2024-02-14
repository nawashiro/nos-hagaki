-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_submittedDataId_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_submittedDataId_fkey" FOREIGN KEY ("submittedDataId") REFERENCES "SubmittedData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
