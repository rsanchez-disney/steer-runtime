export declare const uploadAttachmentSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            pageId: {
                type: string;
                description: string;
            };
            filePath: {
                type: string;
                description: string;
            };
            outputDir: {
                type: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleUploadAttachment(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=uploadAttachment.d.ts.map