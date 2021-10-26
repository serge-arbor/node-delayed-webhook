import Ajv, { JTDDataType } from "ajv/dist/jtd";

const ajv = new Ajv();

const timerPayloadSchema = {
    properties: {
        url: { type: "string" },
    },
    optionalProperties: {
        hours: { type: "uint32" },
        minutes: { type: "uint32" },
        seconds: { type: "uint32" },
    },
} as const;
export type TimerPayload = JTDDataType<typeof timerPayloadSchema>;
const validateTimerPayload = ajv.compile(timerPayloadSchema);

function verifyTimerPayloadStructure(value: any): value is TimerPayload {
    return validateTimerPayload(value);
}

export function verifyTimerPayload(value: any): value is TimerPayload {
    if (!verifyTimerPayloadStructure(value)) {
        return false;
    }

    return (value.hours ?? 0) >= 0 && (value.minutes ?? 0) >= 0 && (value.seconds ?? 0) >= 0;
}

const timerRecordSchema = {
    properties: {
        id: { type: "uint32" },
        url: { type: "string" },
        // Type "string" is used because current epoch in ms is out of the uint32 range,
        // which is max uint type allowed by Ajv parser and safe to pass via JSON, actually.
        deadline: { type: "string" },
    },
} as const;
export type TimerRecord = JTDDataType<typeof timerRecordSchema>;
const validateTimerRecord = ajv.compile(timerRecordSchema);

export function verifyTimerRecord(value: any): value is TimerRecord {
    return validateTimerRecord(value);
}

const sec = 1000;
const min = 60 * sec;
const hour = 60 * min;

export function timerSpecToMs(timer: TimerPayload): number {
    return (timer.hours ?? 0) * hour + (timer.minutes ?? 0) * min + (timer.seconds ?? 0) * sec;
}
