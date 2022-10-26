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
    testRegex: "__tests__\\\\.+\\.test\\.(ts|tsx)$",
    // preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx)": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    // language=file-reference
    setupFiles: ["__tests__/setupFile.ts"],
    // language=file-reference
    setupFilesAfterEnv: ["__tests__/setupFilesAfterEnv.ts"],
};
config.setupFiles = config.setupFiles!.map(v => "<rootDir>" + v);
config.setupFilesAfterEnv = config.setupFilesAfterEnv!.map(v => "<rootDir>" + v);
export default config;
