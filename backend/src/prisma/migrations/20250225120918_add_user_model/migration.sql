-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nick_key" ON "User"("nick");
