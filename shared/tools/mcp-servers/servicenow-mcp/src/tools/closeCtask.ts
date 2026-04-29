import { apiClient } from "../utils/apiClient.js";

export const closeCtaskSchema = {
    name: "close_ctask",
    description: "Close a CTASK with close notes, close code, and target state",
    inputSchema: {
        type: "object",
        properties: {
            ctaskNumber: { type: "string", description: "The CTASK number (e.g. CTASK1234567)" },
            closeNotes: { type: "string", description: "Notes explaining the closure (default: Validated and closed.)" },
            closeCode: {
                type: "string",
                description: "Close code: 'successful', 'unsuccessful', 'issues', 'supplier', or 'disney' (default: successful)",
                enum: ["successful", "unsuccessful", "issues", "supplier", "disney"],
            },
            targetState: {
                type: "string",
                description: "Target close state: 'closed_complete' (3), 'closed_cancelled' (4), 'closed_skipped' (7), or 'successful' (8). Default: closed_complete",
                enum: ["closed_complete", "closed_cancelled", "closed_skipped", "successful"],
            },
        },
        required: ["ctaskNumber"],
    },
};

const STATES: Record<string, { value: string; label: string }> = {
    closed_complete:  { value: "3",  label: "Closed Complete" },
    closed_cancelled: { value: "4",  label: "Closed Cancelled" },
    closed_skipped:   { value: "7",  label: "Closed Skipped" },
    successful:       { value: "8",  label: "Successful" },
};

const CLOSED_VALUES = new Set(["3", "4", "7", "8"]);

const closeCodeLabels: Record<string, string> = {
    successful: "Successful",
    unsuccessful: "Unsuccessful",
    issues: "With Issues",
    supplier: "Per Supplier",
    disney: "Per Disney",
};

async function getState(sysId: string): Promise<{ value: string; label: string }> {
    const res = await apiClient.get(`/table/change_task/${sysId}`, {
        sysparm_fields: "state",
        sysparm_display_value: "all",
    });
    return {
        value: res?.result?.state?.value ?? "",
        label: res?.result?.state?.display_value ?? "",
    };
}

async function tryClose(sysId: string, stateValue: string, closeCode: string, closeNotes: string): Promise<boolean> {
    const closeFields = {
        u_close_code: closeCode,
        u_close_notes: closeNotes,
        close_code: closeCode,
        close_notes: closeNotes,
        work_notes: closeNotes,
    };

    // Approach 1: All close fields + state in a single PATCH
    try {
        await apiClient.patch(`/table/change_task/${sysId}`, { ...closeFields, state: stateValue });
        const after = await getState(sysId);
        if (CLOSED_VALUES.has(after.value)) return true;
    } catch (e: any) {
        // Approach 1 failed, continue to next
    }

    // Approach 2: Set close fields first, then state separately
    try {
        await apiClient.patch(`/table/change_task/${sysId}`, closeFields);
        await apiClient.patch(`/table/change_task/${sysId}`, { state: stateValue });
        const after = await getState(sysId);
        if (CLOSED_VALUES.has(after.value)) return true;
    } catch (e: any) {
        // Approach 2 failed, continue to next
    }

    // Approach 3: State first, then close fields
    try {
        await apiClient.patch(`/table/change_task/${sysId}`, { state: stateValue });
        const after = await getState(sysId);
        if (CLOSED_VALUES.has(after.value)) {
            await apiClient.patch(`/table/change_task/${sysId}`, closeFields);
            return true;
        }
    } catch (e: any) {
        // Approach 3 failed
    }

    return false;
}

export async function handleCloseCtask(args: any) {
    const {
        ctaskNumber,
        closeNotes = "Validated and closed.",
        closeCode = "successful",
        targetState = "closed_complete",
    } = args;

    const target = STATES[targetState];
    if (!target) {
        return {
            content: [{ type: "text", text: JSON.stringify({
                status: "error",
                message: `Invalid targetState '${targetState}'. Valid: closed_complete, closed_cancelled, closed_skipped, successful`,
            }) }],
        };
    }

    const sysId = await apiClient.getSysId("change_task", "number", ctaskNumber);

    // Fetch current state and parent CHG
    const current = await apiClient.get(`/table/change_task/${sysId}`, {
        sysparm_fields: "state,number,change_request",
        sysparm_display_value: "all",
    });
    const currentState = current?.result?.state?.value ?? "";
    const currentStateLabel = current?.result?.state?.display_value ?? currentState;
    const parentChgSysId = current?.result?.change_request?.value ?? "";

    // Already closed — skip
    if (CLOSED_VALUES.has(currentState)) {
        return {
            content: [{ type: "text", text: JSON.stringify({
                status: "skipped",
                ctask: ctaskNumber,
                state: currentStateLabel,
                message: `CTASK is already in '${currentStateLabel}' state`,
            }) }],
        };
    }

    // Check parent CHG state
    if (parentChgSysId) {
        const parentChg = await apiClient.get(`/table/change_request/${parentChgSysId}`, {
            sysparm_fields: "state,number",
            sysparm_display_value: "all",
        });
        const parentState = parentChg?.result?.state?.display_value ?? "";
        const parentNumber = parentChg?.result?.number?.value ?? "";
        const lockedStates = ["complete", "closed", "cancelled"];
        if (lockedStates.some(s => parentState.toLowerCase().includes(s))) {
            return {
                content: [{ type: "text", text: JSON.stringify({
                    status: "blocked",
                    ctask: ctaskNumber,
                    currentState: currentStateLabel,
                    parentChange: parentNumber,
                    parentState: parentState,
                    message: `Cannot close CTASK — parent change ${parentNumber} is in '${parentState}' state. The parent CHG must be reopened first.`,
                }) }],
            };
        }
    }

    // Try closing directly
    let closed = await tryClose(sysId, target.value, closeCode, closeNotes);
    if (closed) {
        const final = await getState(sysId);
        return {
            content: [{ type: "text", text: JSON.stringify({
                status: "success",
                ctask: ctaskNumber,
                previousState: currentStateLabel,
                state: final.label,
                closeCode: closeCodeLabels[closeCode] ?? closeCode,
                message: `CTASK transitioned: ${currentStateLabel} → ${final.label} (${closeCodeLabels[closeCode]})`,
            }) }],
        };
    }

    // If direct close failed, try stepping through intermediate states
    const stepStates = ["2", "1"]; // WIP, In Progress
    for (const step of stepStates) {
        if (step === currentState) continue;
        await apiClient.patch(`/table/change_task/${sysId}`, { state: step });
        const mid = await getState(sysId);
        if (mid.value !== currentState) {
            // Intermediate transition worked, try closing again
            closed = await tryClose(sysId, target.value, closeCode, closeNotes);
            if (closed) {
                const final = await getState(sysId);
                return {
                    content: [{ type: "text", text: JSON.stringify({
                        status: "success",
                        ctask: ctaskNumber,
                        previousState: currentStateLabel,
                        state: final.label,
                        closeCode: closeCodeLabels[closeCode] ?? closeCode,
                        message: `CTASK transitioned: ${currentStateLabel} → ${mid.label} → ${final.label} (${closeCodeLabels[closeCode]})`,
                    }) }],
                };
            }
        }
    }

    // All attempts failed
    const finalState = await getState(sysId);
    return {
        content: [{ type: "text", text: JSON.stringify({
            status: "failed",
            ctask: ctaskNumber,
            currentState: finalState.label,
            targetState: target.label,
            attempts: [
                "PATCH state directly",
                "PATCH with sysparm_action=insert_or_update",
                "PATCH with sysparm_input_display_value=false",
                "Step through WIP/In Progress then close",
            ],
            message: `CTASK could not be closed after multiple API approaches. Current state: '${finalState.label}'. Your ServiceNow instance likely requires UI-based workflow transitions for CTASK closure. Contact your ServiceNow admin to check business rules on the change_task table.`,
        }) }],
    };
}
