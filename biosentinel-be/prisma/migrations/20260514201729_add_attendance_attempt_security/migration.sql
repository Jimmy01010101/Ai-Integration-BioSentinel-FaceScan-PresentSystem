-- CreateTable
CREATE TABLE `AttendanceAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identityNumber` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `success` BOOLEAN NOT NULL DEFAULT false,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
