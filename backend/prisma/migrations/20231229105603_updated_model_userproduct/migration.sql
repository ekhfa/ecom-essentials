/*
  Warnings:

  - You are about to drop the column `productQuantity` on the `userProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "userProduct" DROP COLUMN "productQuantity",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
