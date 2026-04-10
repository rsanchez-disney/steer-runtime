export declare const getConfluenceSpaceSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            spaceKey: {
                type: string;
                description: string;
            };
            expand: {
                type: string;
                description: string;
                default: string;
            };
            outputDir: {
                type: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleGetConfluenceSpace(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=getConfluenceSpace.d.ts.map