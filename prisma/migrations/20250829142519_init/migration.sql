-- DropForeignKey
ALTER TABLE "app"."virtual_tours" DROP CONSTRAINT "virtual_tours_created_by_id_fkey";

-- AlterTable
ALTER TABLE "app"."virtual_tours" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "app"."virtual_tours" ADD CONSTRAINT "virtual_tours_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
