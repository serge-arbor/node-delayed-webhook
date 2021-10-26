const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
    ...tsjPreset,
    testEnvironment: "node",
    testMatch: ["!**/build/**/*", "**/src/**/*.test.ts"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.spec.json",
        },
    },
    collectCoverage: true,
    verbose: true,
};
