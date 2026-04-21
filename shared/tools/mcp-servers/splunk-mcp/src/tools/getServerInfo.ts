import { apiClient } from "../utils/apiClient.js";

export const getServerInfoSchema = {
    name: "get_server_info",
    description: "Get Splunk server information (version, OS, license)",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleGetServerInfo() {
    const data = await apiClient.get("/services/server/info");
    const entry = data?.entry?.[0]?.content;

    const info = {
        serverName: entry?.serverName,
        version: entry?.version,
        build: entry?.build,
        os: entry?.os_name,
        cpuArch: entry?.cpu_arch,
        licenseState: entry?.licenseState,
        isFree: entry?.isFree,
    };

    return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
    };
}
