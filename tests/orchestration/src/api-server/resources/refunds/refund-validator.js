'use strict';

const logger = require('../../core/logger');

/**
 * Converts a dollar amount to integer cents to avoid floating-point precision issues.
 *
 * @param {number} value - A numeric dollar amount.
 * @returns {number} The amount in cents (integer).
 */
function toCents(value) {
    return Math.round(value * 100);
}

/**
 * Checks whether a value is a valid, finite, non-negative number.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} true if the value is a valid non-negative number.
 */
function isValidAmount(value) {
    return typeof value === 'number' && isFinite(value) && value >= 0;
}

/**
 * RefundValidator — validates refund-related business rules at the BFF layer.
 * Acts as defense-in-depth for DPAY-14500.
 */
const RefundValidator = {
    /**
     * Validates that a refund amount does not exceed the original transaction charge.
     *
     * Returns `true` when the refund is valid (amount <= originalCharge).
     * Returns `false` for any invalid input or when amount exceeds the original charge.
     * Logs a structured warning when validation fails.
     *
     * @param {number} amount - The refund amount requested (in dollars).
     * @param {number} originalCharge - The original transaction amount (in dollars).
     * @returns {boolean} true if valid refund, false otherwise.
     */
    validateRefundAmount(amount, originalCharge) {
        if (!isValidAmount(amount)) {
            logger.warn({
                event: 'refund_validation_failed',
                reason: 'invalid_amount',
                amount,
                originalCharge
            }, 'Refund validation failed: amount is not a valid non-negative number');
            return false;
        }

        if (!isValidAmount(originalCharge)) {
            logger.warn({
                event: 'refund_validation_failed',
                reason: 'invalid_original_charge',
                amount,
                originalCharge
            }, 'Refund validation failed: originalCharge is not a valid non-negative number');
            return false;
        }

        // Compare in cents to avoid floating-point precision issues
        const amountCents = toCents(amount);
        const originalChargeCents = toCents(originalCharge);

        if (amountCents > originalChargeCents) {
            logger.warn({
                event: 'refund_validation_failed',
                reason: 'exceeds_original_charge',
                amount,
                originalCharge,
                amountCents,
                originalChargeCents
            }, 'Refund validation failed: amount exceeds original charge');
            return false;
        }

        return true;
    }
};

module.exports = RefundValidator;
