-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendDay" TIMESTAMP(3) NOT NULL,
    "event" JSONB NOT NULL,
    "relays" TEXT[],

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);
