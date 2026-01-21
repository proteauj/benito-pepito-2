/*
  Warnings:

  - A unique constraint covering the columns `[squarePaymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Made the column `squarePaymentId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "squarePaymentId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_squarePaymentId_key" ON "Order"("squarePaymentId");
