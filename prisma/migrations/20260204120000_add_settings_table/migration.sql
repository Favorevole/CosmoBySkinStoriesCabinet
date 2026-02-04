-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- Insert default values
INSERT INTO "settings" ("key", "value", "updated_at") VALUES
('skin_problems', '["Акне / прыщи", "Сухость и шелушение", "Жирный блеск", "Пигментация", "Морщины", "Покраснения", "Расширенные поры", "Чувствительность"]', NOW());
