export declare const getConfluencePageSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            pageId: {
                type: string;
                description: string;
            };
            spaceKey: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            expand: {
                type: string;
                description: string;
                default: string;
            };
            maxLength: {
                type: string;
                description: string;
            };
            outputDir: {
                type: string[];
                description: string;
            };
        };
        required: never[];
    };
};
export declare function handleGetConfluencePage(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=getConfluencePage.d.ts.map