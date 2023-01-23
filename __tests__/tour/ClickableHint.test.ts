import {describe, test, expect} from "@jest/globals";
import {ClickableHint, Position} from "../../tour/tour";

describe("Test the functionality of the clickable hints", function () {
    describe("rotation", () => {
        const clickablePos: Position = {
            x: 1000,
            y: 1000,
        };

        test("clickable right", () => {
            const pos: Position = {
                x: 100,
                y: 1000,
            };
            expect(ClickableHint.computeRotation(pos, clickablePos)).toBe(0);
        });

        test("clickable left", () => {
            const pos: Position = {
                x: 10000,
                y: 1000,
            };
            expect(ClickableHint.computeRotation(pos, clickablePos)).toBe(Math.PI);
        });

        test("clickable top", () => {
            const pos: Position = {
                x: 1000,
                y: 10000,
            };
            expect(ClickableHint.computeRotation(pos, clickablePos)).toBe(-0.5 * Math.PI);
        });

        test("clickable bottom", () => {
            const pos: Position = {
                x: 1000,
                y: 100,
            };
            expect(ClickableHint.computeRotation(pos, clickablePos)).toBe(0.5 * Math.PI);
        });


        test("clickable bottom right", () => {
            const pos: Position = {
                x: 100,
                y: 100,
            };
            expect([0.25, -1.75]).toContain(ClickableHint.computeRotation(pos, clickablePos)/Math.PI);
        });

        test("clickable bottom left", () => {
            const pos: Position = {
                x: 1900,
                y: 100,
            };
            expect([0.75, -1.25]).toContain(ClickableHint.computeRotation(pos, clickablePos) / Math.PI);
        });

        test("clickable top right", () => {
            const pos: Position = {
                x: 100,
                y: 1900,
            };
            expect([-0.25, 1.75]).toContain(ClickableHint.computeRotation(pos, clickablePos)/ Math.PI);
        });

        test("clickable top left", () => {
            const pos: Position = {
                x: 1900,
                y: 1900,
            };
            expect([-0.75 , 1.25]).toContain(ClickableHint.computeRotation(pos, clickablePos)/ Math.PI);
        });
    });
});
