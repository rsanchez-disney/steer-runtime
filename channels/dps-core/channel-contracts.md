# DPS Core — Channel Contracts

## Channel Identifier
- Direct (DD): company=DD, division=DDDLR, brand=CORE, distributionChannel=I
- TBX (WDTC): company=WDTC, division=WDTCDLR, brand=CORE, distributionChannel=C, clientGroup=TA
- DLP Direct: company=024, division=DPV, brand=RBB, distributionChannel=I
- DLP TBX: company=024, division=DPV, brand=RBB, distributionChannel=3, clientGroup=TO

## API Flow
1. Offer Search → returns scored/ranked packages
2. Selected Package Offer → user picks specific package
3. Quote → locks price
4. Freeze → reserves inventory
5. Confirm → completes booking (handled by downstream)
