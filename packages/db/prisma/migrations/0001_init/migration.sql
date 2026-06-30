-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('BALANCE', 'OWNERSHIP', 'AGE', 'MEMBERSHIP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROOF_VERIFIED', 'PROOF_REVOKED', 'SYSTEM', 'CIRCUIT_REGISTERED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "displayName" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "nonce" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "notificationPrefs" JSONB NOT NULL DEFAULT '{}',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,
    "blockTime" TIMESTAMP(3),
    "fee" BIGINT NOT NULL,
    "feePayer" TEXT NOT NULL,
    "status" "TxStatus" NOT NULL,
    "computeUnits" INTEGER,
    "programIds" TEXT[],
    "errorMessage" TEXT,
    "rawLogs" TEXT[],
    "involvesUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructionRecord" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "programId" TEXT NOT NULL,
    "accounts" TEXT[],
    "data" BYTEA NOT NULL,
    "decoded" JSONB,

    CONSTRAINT "InstructionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofRecord" (
    "id" TEXT NOT NULL,
    "proofAccount" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "circuitId" INTEGER NOT NULL,
    "circuitName" TEXT NOT NULL,
    "proofType" "ProofType" NOT NULL,
    "publicInputs" JSONB NOT NULL,
    "proofData" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "slotVerified" BIGINT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circuit" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "proofType" "ProofType" NOT NULL,
    "description" TEXT,
    "publicInputCount" INTEGER NOT NULL,
    "verifyingKey" TEXT NOT NULL,
    "wasmUrl" TEXT,
    "zkeyUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "registeredSlot" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockSnapshot" (
    "slot" BIGINT NOT NULL,
    "blockhash" TEXT NOT NULL,
    "parentSlot" BIGINT NOT NULL,
    "blockTime" TIMESTAMP(3),
    "txCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockSnapshot_pkey" PRIMARY KEY ("slot")
);

-- CreateTable
CREATE TABLE "WatchedAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchedAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkStat" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tps" DOUBLE PRECISION NOT NULL,
    "slot" BIGINT NOT NULL,
    "totalProofs" BIGINT NOT NULL,
    "proofs24h" INTEGER NOT NULL,
    "avgVerifyTimeMs" INTEGER NOT NULL,
    "activeUsers24h" INTEGER NOT NULL,
    "rpcLatencyMs" INTEGER NOT NULL,

    CONSTRAINT "NetworkStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pubkey_key" ON "User"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_pubkey_idx" ON "User"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_signature_key" ON "Transaction"("signature");

-- CreateIndex
CREATE INDEX "Transaction_feePayer_idx" ON "Transaction"("feePayer");

-- CreateIndex
CREATE INDEX "Transaction_slot_idx" ON "Transaction"("slot");

-- CreateIndex
CREATE INDEX "Transaction_blockTime_idx" ON "Transaction"("blockTime");

-- CreateIndex
CREATE INDEX "Transaction_involvesUserId_idx" ON "Transaction"("involvesUserId");

-- CreateIndex
CREATE INDEX "InstructionRecord_transactionId_index_idx" ON "InstructionRecord"("transactionId", "index");

-- CreateIndex
CREATE INDEX "InstructionRecord_programId_idx" ON "InstructionRecord"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProofRecord_proofAccount_key" ON "ProofRecord"("proofAccount");

-- CreateIndex
CREATE INDEX "ProofRecord_authority_idx" ON "ProofRecord"("authority");

-- CreateIndex
CREATE INDEX "ProofRecord_proofType_idx" ON "ProofRecord"("proofType");

-- CreateIndex
CREATE INDEX "ProofRecord_slotVerified_idx" ON "ProofRecord"("slotVerified");

-- CreateIndex
CREATE INDEX "ProofRecord_userId_idx" ON "ProofRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Circuit_name_key" ON "Circuit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlockSnapshot_blockhash_key" ON "BlockSnapshot"("blockhash");

-- CreateIndex
CREATE INDEX "BlockSnapshot_blockTime_idx" ON "BlockSnapshot"("blockTime");

-- CreateIndex
CREATE UNIQUE INDEX "WatchedAddress_userId_pubkey_key" ON "WatchedAddress"("userId", "pubkey");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NetworkStat_timestamp_key" ON "NetworkStat"("timestamp");

-- CreateIndex
CREATE INDEX "NetworkStat_timestamp_idx" ON "NetworkStat"("timestamp");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructionRecord" ADD CONSTRAINT "InstructionRecord_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofRecord" ADD CONSTRAINT "ProofRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedAddress" ADD CONSTRAINT "WatchedAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

