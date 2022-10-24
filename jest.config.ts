import type {JestConfigWithTsJest} from "ts-jest";

const config: JestConfigWithTsJest = {
    clearMocks: true,
    collectCoverage: true,
    coverageProvider: "v8",
    collectCoverageFrom: [
        "**/*.ts",
        "**/*.tsx",
    ],
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    testRegex: ".*\\.test\\.(ts|tsx)$",
    // preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.(ts|tsx)": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    testTimeout: 30000,
};
export default config;
