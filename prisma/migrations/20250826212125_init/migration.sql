-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "invite_code" TEXT,
    "paired_with" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pairs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_a_id" TEXT NOT NULL,
    "user_b_id" TEXT NOT NULL,
    "delay_seconds" INTEGER NOT NULL DEFAULT 86400,
    "turn_user_id" TEXT NOT NULL,
    "last_sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pairs_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pairs_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "letters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pair_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body_text" TEXT NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "letters_pair_id_fkey" FOREIGN KEY ("pair_id") REFERENCES "pairs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "letters_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_invite_code_key" ON "users"("invite_code");
