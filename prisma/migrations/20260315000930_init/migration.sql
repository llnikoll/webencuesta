-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revealAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "options_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "deviceFingerprint" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "cookieId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "votes_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "votes_pollId_ipHash_key" ON "votes"("pollId", "ipHash");

-- CreateIndex
CREATE UNIQUE INDEX "votes_pollId_cookieId_key" ON "votes"("pollId", "cookieId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_pollId_deviceFingerprint_key" ON "votes"("pollId", "deviceFingerprint");
