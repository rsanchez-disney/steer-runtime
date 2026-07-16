'use strict';

const chai = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');
const expect = chai.expect;

describe('RefundValidator', () => {
    let sandbox;
    let RefundValidator;
    let loggerStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        loggerStub = {
            warn: sandbox.stub(),
            info: sandbox.stub(),
            error: sandbox.stub()
        };

        mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
        mockery.registerMock('../../core/logger', loggerStub);

        RefundValidator = require('./refund-validator');
    });

    afterEach(() => {
        sandbox.restore();
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('validateRefundAmount', () => {
        describe('happy path', () => {
            it('should return true when amount is less than originalCharge', () => {
                expect(RefundValidator.validateRefundAmount(50, 100)).to.be.true;
            });

            it('should return true when amount is significantly less than originalCharge', () => {
                expect(RefundValidator.validateRefundAmount(1, 9999.99)).to.be.true;
            });

            it('should return true when amount is zero', () => {
                expect(RefundValidator.validateRefundAmount(0, 100)).to.be.true;
            });

            it('should return true when both amount and originalCharge are zero', () => {
                expect(RefundValidator.validateRefundAmount(0, 0)).to.be.true;
            });

            it('should not log a warning on valid refund', () => {
                RefundValidator.validateRefundAmount(50, 100);
                expect(loggerStub.warn.called).to.be.false;
            });
        });

        describe('boundary: amount equals originalCharge', () => {
            it('should return true when amount equals originalCharge (integer)', () => {
                expect(RefundValidator.validateRefundAmount(100, 100)).to.be.true;
            });

            it('should return true when amount equals originalCharge (decimal)', () => {
                expect(RefundValidator.validateRefundAmount(99.99, 99.99)).to.be.true;
            });
        });

        describe('invalid: amount exceeds originalCharge', () => {
            it('should return false when amount exceeds originalCharge', () => {
                expect(RefundValidator.validateRefundAmount(150, 100)).to.be.false;
            });

            it('should return false when amount exceeds by a small fraction', () => {
                expect(RefundValidator.validateRefundAmount(100.01, 100)).to.be.false;
            });

            it('should log a warning when amount exceeds originalCharge', () => {
                RefundValidator.validateRefundAmount(150, 100);
                expect(loggerStub.warn.calledOnce).to.be.true;
                const logContext = loggerStub.warn.firstCall.args[0];
                expect(logContext.event).to.equal('refund_validation_failed');
                expect(logContext.reason).to.equal('exceeds_original_charge');
                expect(logContext.amount).to.equal(150);
                expect(logContext.originalCharge).to.equal(100);
            });
        });

        describe('edge: null/undefined inputs', () => {
            it('should return false when amount is null', () => {
                expect(RefundValidator.validateRefundAmount(null, 100)).to.be.false;
            });

            it('should return false when amount is undefined', () => {
                expect(RefundValidator.validateRefundAmount(undefined, 100)).to.be.false;
            });

            it('should return false when originalCharge is null', () => {
                expect(RefundValidator.validateRefundAmount(50, null)).to.be.false;
            });

            it('should return false when originalCharge is undefined', () => {
                expect(RefundValidator.validateRefundAmount(50, undefined)).to.be.false;
            });

            it('should return false when both are null', () => {
                expect(RefundValidator.validateRefundAmount(null, null)).to.be.false;
            });

            it('should log a warning for null amount', () => {
                RefundValidator.validateRefundAmount(null, 100);
                expect(loggerStub.warn.calledOnce).to.be.true;
                const logContext = loggerStub.warn.firstCall.args[0];
                expect(logContext.reason).to.equal('invalid_amount');
            });

            it('should log a warning for null originalCharge', () => {
                RefundValidator.validateRefundAmount(50, null);
                expect(loggerStub.warn.calledOnce).to.be.true;
                const logContext = loggerStub.warn.firstCall.args[0];
                expect(logContext.reason).to.equal('invalid_original_charge');
            });
        });

        describe('edge: negative amounts', () => {
            it('should return false when amount is negative', () => {
                expect(RefundValidator.validateRefundAmount(-1, 100)).to.be.false;
            });

            it('should return false when originalCharge is negative', () => {
                expect(RefundValidator.validateRefundAmount(50, -10)).to.be.false;
            });

            it('should log a warning for negative amount', () => {
                RefundValidator.validateRefundAmount(-5, 100);
                expect(loggerStub.warn.calledOnce).to.be.true;
                const logContext = loggerStub.warn.firstCall.args[0];
                expect(logContext.reason).to.equal('invalid_amount');
            });
        });

        describe('edge: non-numeric values', () => {
            it('should return false when amount is a string', () => {
                expect(RefundValidator.validateRefundAmount('50', 100)).to.be.false;
            });

            it('should return false when originalCharge is a string', () => {
                expect(RefundValidator.validateRefundAmount(50, '100')).to.be.false;
            });

            it('should return false when amount is NaN', () => {
                expect(RefundValidator.validateRefundAmount(NaN, 100)).to.be.false;
            });

            it('should return false when originalCharge is NaN', () => {
                expect(RefundValidator.validateRefundAmount(50, NaN)).to.be.false;
            });

            it('should return false when amount is Infinity', () => {
                expect(RefundValidator.validateRefundAmount(Infinity, 100)).to.be.false;
            });

            it('should return false when originalCharge is Infinity', () => {
                expect(RefundValidator.validateRefundAmount(50, Infinity)).to.be.false;
            });

            it('should return false when amount is a boolean', () => {
                expect(RefundValidator.validateRefundAmount(true, 100)).to.be.false;
            });

            it('should return false when amount is an object', () => {
                expect(RefundValidator.validateRefundAmount({}, 100)).to.be.false;
            });

            it('should return false when amount is an array', () => {
                expect(RefundValidator.validateRefundAmount([50], 100)).to.be.false;
            });
        });

        describe('edge: floating-point precision', () => {
            it('should handle 10.10 + 10.20 comparison correctly', () => {
                // In raw floating-point: 10.10 + 10.20 = 20.299999999999997
                const amount = 10.10 + 10.20;
                const originalCharge = 20.30;
                expect(RefundValidator.validateRefundAmount(amount, originalCharge)).to.be.true;
            });

            it('should handle 0.1 + 0.2 comparison correctly', () => {
                // In raw floating-point: 0.1 + 0.2 = 0.30000000000000004
                const amount = 0.1 + 0.2;
                const originalCharge = 0.30;
                expect(RefundValidator.validateRefundAmount(amount, originalCharge)).to.be.true;
            });

            it('should handle many small additions correctly', () => {
                // Sum of ten 0.10 values
                let amount = 0;
                for (let i = 0; i < 10; i++) {
                    amount += 0.10;
                }
                expect(RefundValidator.validateRefundAmount(amount, 1.00)).to.be.true;
            });

            it('should correctly reject amount exceeding by one cent', () => {
                expect(RefundValidator.validateRefundAmount(100.01, 100.00)).to.be.false;
            });

            it('should correctly accept amount less by one cent', () => {
                expect(RefundValidator.validateRefundAmount(99.99, 100.00)).to.be.true;
            });
        });
    });
});
