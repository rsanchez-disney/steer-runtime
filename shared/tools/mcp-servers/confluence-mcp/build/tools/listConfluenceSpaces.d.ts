export declare const listConfluenceSpacesSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            start: {
                type: string;
                description: string;
                default: number;
            };
            limit: {
                type: string;
                description: string;
                default: number;
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
        required: never[];
    };
};
export declare function handleListConfluenceSpaces(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=listConfluenceSpaces.d.ts.map