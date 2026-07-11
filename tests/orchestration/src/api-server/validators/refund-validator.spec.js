'use strict';

const chai = require('chai');
const expect = chai.expect;

const RefundValidator = require('./refund-validator');

describe('RefundValidator', () => {
    describe('validateRefundAmount', () => {
        it('should return true when amount is less than originalCharge', () => {
            expect(RefundValidator.validateRefundAmount(50, 100)).to.be.true;
        });

        it('should return true when amount equals originalCharge', () => {
            expect(RefundValidator.validateRefundAmount(100, 100)).to.be.true;
        });

        it('should return false when amount exceeds originalCharge', () => {
            expect(RefundValidator.validateRefundAmount(150, 100)).to.be.false;
        });

        it('should return true when amount is zero', () => {
            expect(RefundValidator.validateRefundAmount(0, 100)).to.be.true;
        });

        it('should return true when both amount and originalCharge are zero', () => {
            expect(RefundValidator.validateRefundAmount(0, 0)).to.be.true;
        });

        it('should handle decimal amounts correctly', () => {
            expect(RefundValidator.validateRefundAmount(99.99, 100)).to.be.true;
            expect(RefundValidator.validateRefundAmount(100.01, 100)).to.be.false;
        });

        it('should throw an error when amount is negative', () => {
            expect(() => RefundValidator.validateRefundAmount(-1, 100))
                .to.throw('amount must be >= 0');
        });

        it('should throw an error when originalCharge is negative', () => {
            expect(() => RefundValidator.validateRefundAmount(50, -10))
                .to.throw('originalCharge must be >= 0');
        });

        it('should throw an error when amount is not a number', () => {
            expect(() => RefundValidator.validateRefundAmount('50', 100))
                .to.throw('amount must be a valid number');
            expect(() => RefundValidator.validateRefundAmount(null, 100))
                .to.throw('amount must be a valid number');
            expect(() => RefundValidator.validateRefundAmount(undefined, 100))
                .to.throw('amount must be a valid number');
        });

        it('should throw an error when originalCharge is not a number', () => {
            expect(() => RefundValidator.validateRefundAmount(50, '100'))
                .to.throw('originalCharge must be a valid number');
            expect(() => RefundValidator.validateRefundAmount(50, null))
                .to.throw('originalCharge must be a valid number');
            expect(() => RefundValidator.validateRefundAmount(50, undefined))
                .to.throw('originalCharge must be a valid number');
        });

        it('should throw an error when amount is NaN', () => {
            expect(() => RefundValidator.validateRefundAmount(NaN, 100))
                .to.throw('amount must be a valid number');
        });

        it('should throw an error when originalCharge is NaN', () => {
            expect(() => RefundValidator.validateRefundAmount(50, NaN))
                .to.throw('originalCharge must be a valid number');
        });
    });
});
