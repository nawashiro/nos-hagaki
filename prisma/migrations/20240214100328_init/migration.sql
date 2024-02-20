-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "sended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendDay" TIMESTAMP(3) NOT NULL,
    "event" JSONB NOT NULL,
    "relays" TEXT[],
    "ip" TEXT NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);
