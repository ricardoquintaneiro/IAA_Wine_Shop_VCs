pragma circom 2.0.0;
include "circomlib/circuits/comparators.circom";

template AgeCheckTimestamp() {
    signal input birthTimestamp;   // Unix timestamp of date of birth
    signal input currentTimestamp; // Unix timestamp of "now"
    signal output isOldEnough;     // 1 if yes, 0 otherwise

    var eighteenYearsInSeconds = 568036800;

    // Check if currentTimestamp >= birthTimestamp
    component lt1 = LessThan(64);
    lt1.in[0] <== currentTimestamp;
    lt1.in[1] <== birthTimestamp;
    signal isValidTimestamp;
    isValidTimestamp <== 1 - lt1.out; // 1 if current >= birth

    // Calculate ageDiff only if valid
    signal ageDiff;
    ageDiff <== isValidTimestamp * (currentTimestamp - birthTimestamp);

    // Check if ageDiff >= eighteenYearsInSeconds
    component lt2 = LessThan(64);
    lt2.in[0] <== ageDiff;
    lt2.in[1] <== eighteenYearsInSeconds;
    signal isGreaterOrEqual;
    isGreaterOrEqual <== 1 - lt2.out; // 1 if ageDiff >= threshold

    isOldEnough <== isGreaterOrEqual;
}

component main = AgeCheckTimestamp();
