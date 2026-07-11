'use strict';

/**
 * RefundValidator - Validates refund-related business rules.
 */
const RefundValidator = {
    /**
     * Validates that a refund amount does not exceed the original charge.
     *
     * @param {number} amount - The refund amount to validate. Must be a number >= 0.
     * @param {number} originalCharge - The original charge amount. Must be a number >= 0.
     * @returns {boolean} true if amount <= originalCharge, false otherwise.
     * @throws {Error} If either argument is not a number or is negative.
     */
    validateRefundAmount(amount, originalCharge) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('amount must be a valid number');
        }
        if (typeof originalCharge !== 'number' || isNaN(originalCharge)) {
            throw new Error('originalCharge must be a valid number');
        }
        if (amount < 0) {
            throw new Error('amount must be >= 0');
        }
        if (originalCharge < 0) {
            throw new Error('originalCharge must be >= 0');
        }

        return amount <= originalCharge;
    }
};

module.exports = RefundValidator;
