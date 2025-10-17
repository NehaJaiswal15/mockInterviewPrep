// /types/vapi.d.ts
import "@vapi-ai/web";

//
// --- Your existing message definitions ---
//
export enum MessageTypeEnum {
    TRANSCRIPT = "transcript",
    FUNCTION_CALL = "function-call",
    FUNCTION_CALL_RESULT = "function-call-result",
    ADD_MESSAGE = "add-message",
}

export enum MessageRoleEnum {
    USER = "user",
    SYSTEM = "system",
    ASSISTANT = "assistant",
}

export enum TranscriptMessageTypeEnum {
    PARTIAL = "partial",
    FINAL = "final",
}

export interface BaseMessage {
    type: MessageTypeEnum;
}

export interface TranscriptMessage extends BaseMessage {
    type: MessageTypeEnum.TRANSCRIPT;
    role: MessageRoleEnum;
    transcriptType: TranscriptMessageTypeEnum;
    transcript: string;
}

export interface FunctionCallMessage extends BaseMessage {
    type: MessageTypeEnum.FUNCTION_CALL;
    functionCall: {
        name: string;
        parameters: unknown;
    };
}

export interface FunctionCallResultMessage extends BaseMessage {
    type: MessageTypeEnum.FUNCTION_CALL_RESULT;
    functionCallResult: {
        forwardToClientEnabled?: boolean;
        result: unknown;
        [a: string]: unknown;
    };
}

export type Message =
    | TranscriptMessage
    | FunctionCallMessage
    | FunctionCallResultMessage;

//
// --- ✅ Extend Vapi SDK typing (for version 2.4.0) ---
//
declare module "@vapi-ai/web" {
    interface Vapi {
        on(
            event:
                | "message"
                | "speech-start"
                | "speech-end"
                | "error"
                | "state-change", // ✅ state-change supported in 2.4.0
            handler: (data: unknown) => void
        ): void;

        off(
            event:
                | "message"
                | "speech-start"
                | "speech-end"
                | "error"
                | "state-change",
            handler: (data: unknown) => void
        ): void;

        // ✅ Flattened .start() definition (for 2.4.0)
        start(args: {
            type: "agent" | "workflow";
            id: string;
            variables?: Record<string, unknown>;
        }): Promise<void>;

        stop(): Promise<void>;
    }
}
