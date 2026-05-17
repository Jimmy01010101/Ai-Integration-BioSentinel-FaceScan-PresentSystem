/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `faceImage` on the `Attendance` table. All the data in the column will be lost.
  - The values [SUCCESS,FAILED,SPOOF_DETECTED,LATE] on the enum `Attendance_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attendanceCode` on the `AttendanceSession` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SpoofLog` table. All the data in the column will be lost.
  - You are about to drop the column `detectedType` on the `SpoofLog` table. All the data in the column will be lost.
  - You are about to drop the column `faceImage` on the `SpoofLog` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceEndTime` on the `SystemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceStartTime` on the `SystemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableAntiSpoof` on the `SystemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableBlinkVerification` on the `SystemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableLivenessDetection` on the `SystemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableSmileVerification` on the `SystemSetting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,attendanceSessionId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[settingKey]` on the table `SystemSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reason` to the `SpoofLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settingKey` to the `SystemSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settingValue` to the `SystemSetting` table without a default value. This is not possible if the table is not empty.
  - Made the column `division` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Attendance` DROP COLUMN `checkInTime`,
    DROP COLUMN `faceImage`,
    MODIFY `confidenceScore` DOUBLE NULL,
    MODIFY `status` ENUM('HADIR', 'ABSEN', 'IZIN', 'SAKIT', 'CUTI') NOT NULL;

-- AlterTable
ALTER TABLE `AttendanceSession` DROP COLUMN `attendanceCode`;

-- AlterTable
ALTER TABLE `SpoofLog` DROP COLUMN `description`,
    DROP COLUMN `detectedType`,
    DROP COLUMN `faceImage`,
    ADD COLUMN `imagePath` VARCHAR(191) NULL,
    ADD COLUMN `reason` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `SuperAdmin` ADD COLUMN `fullName` VARCHAR(191) NOT NULL DEFAULT 'Super Admin',
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `SystemSetting` DROP COLUMN `attendanceEndTime`,
    DROP COLUMN `attendanceStartTime`,
    DROP COLUMN `enableAntiSpoof`,
    DROP COLUMN `enableBlinkVerification`,
    DROP COLUMN `enableLivenessDetection`,
    DROP COLUMN `enableSmileVerification`,
    ADD COLUMN `settingKey` VARCHAR(191) NOT NULL,
    ADD COLUMN `settingValue` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `division` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Attendance_userId_attendanceSessionId_key` ON `Attendance`(`userId`, `attendanceSessionId`);

-- CreateIndex
CREATE UNIQUE INDEX `SystemSetting_settingKey_key` ON `SystemSetting`(`settingKey`);
