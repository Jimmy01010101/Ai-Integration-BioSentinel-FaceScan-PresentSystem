-- AlterTable
ALTER TABLE `Attendance` ADD COLUMN `faceDistance` DOUBLE NULL;

-- AlterTable
ALTER TABLE `AttendanceAttempt` ADD COLUMN `confidenceScore` DOUBLE NULL,
    ADD COLUMN `faceDistance` DOUBLE NULL;

-- AlterTable
ALTER TABLE `SpoofLog` ADD COLUMN `confidence` DOUBLE NULL,
    ADD COLUMN `deviceInfo` TEXT NULL,
    ADD COLUMN `identityNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `biometricStatus` ENUM('ACTIVE', 'RESET_REQUIRED', 'REENROLL_REQUIRED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `biometricUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `biometricVersion` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `SpoofLog` ADD CONSTRAINT `SpoofLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
