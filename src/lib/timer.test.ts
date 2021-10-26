import { timerSpecToMs } from "./timer";

describe("timerSpecToMs", () => {
    it("should convert timer specification to milliseconds", function () {
        const seconds = 10;
        const minutes = 5;
        const hours = 1;

        const result = timerSpecToMs({ url: "", seconds, minutes, hours });
        expect(result).toEqual(seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000);
    });
});
