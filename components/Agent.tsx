'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { Message } from "@/types/vapi";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

// ✅ Local interface for vapi 2.4.0 (no assistant key)
interface VapiClient {
    on: (
        event: "state-change" | "message" | "speech-start" | "speech-end" | "error",
        handler: (payload: unknown) => void
    ) => void;
    off: (
        event: "state-change" | "message" | "speech-start" | "speech-end" | "error",
        handler: (payload: unknown) => void
    ) => void;
    start: (args: {
        type: "agent" | "workflow"; // ✅ flattened format
        id: string;
        variables?: Record<string, unknown>;
    }) => Promise<void>;
    stop: () => Promise<void>;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    const vapiClient = vapi as unknown as VapiClient;

    useEffect(() => {
        const onMessage = (message: unknown) => {
            const msg = message as Message;
            if (msg.type === "transcript" && msg.transcriptType === "final") {
                const newMessage: SavedMessage = {
                    role: msg.role,
                    content: msg.transcript ?? "",
                };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: unknown) => {
            console.error("Vapi Error:", error);

            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Stack:", error.stack);
            } else {
                console.error("Raw error object:", JSON.stringify(error, null, 2));
            }
        };

        const onStateChange = (state: unknown) => {
            if (typeof state !== "string") return;
            console.log("Vapi state:", state);
            if (state === "connected") setCallStatus(CallStatus.ACTIVE);
            if (state === "disconnected") setCallStatus(CallStatus.FINISHED);
        };

        vapiClient.on("state-change", onStateChange);
        vapiClient.on("message", onMessage);
        vapiClient.on("speech-start", onSpeechStart);
        vapiClient.on("speech-end", onSpeechEnd);
        vapiClient.on("error", onError);

        return () => {
            vapiClient.off("state-change", onStateChange);
            vapiClient.off("message", onMessage);
            vapiClient.off("speech-start", onSpeechStart);
            vapiClient.off("speech-end", onSpeechEnd);
            vapiClient.off("error", onError);
        };
    }, [vapiClient]);

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            router.push("/");
        }
    }, [callStatus, router]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        try {
            console.log("Using workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);

            await vapiClient.start({
                type: "workflow", // ✅ correct for 2.4.0
                id: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
                variables: {
                    username: userName,
                    userId: userId,
                    type: type,
                },
            });

            setCallStatus(CallStatus.ACTIVE);
        } catch (err) {
            console.error("Error starting workflow:", err);
            setCallStatus(CallStatus.INACTIVE);
        }
    };


    const handleDisconnect = async () => {
        await vapiClient.stop();
        setCallStatus(CallStatus.FINISHED);
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished =
        callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="vapi"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="user avatar"
                            width={540}
                            height={540}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={latestMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
            <span
                className={cn(
                    "absolute animate-ping rounded-full opacity-75",
                    callStatus !== "CONNECTING" && "hidden"
                )}
            />
                        <span>{isCallInactiveOrFinished ? "Call" : ". . ."}</span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;
