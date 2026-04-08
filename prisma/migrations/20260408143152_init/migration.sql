-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "participants" TEXT NOT NULL,
    "last_message" TEXT NOT NULL,
    "last_message_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_sender" TEXT NOT NULL
);
