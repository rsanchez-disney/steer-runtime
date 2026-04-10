export declare const createConfluencePageSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            spaceKey: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            body: {
                type: string;
                description: string;
            };
            parentId: {
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
export declare function handleCreateConfluencePage(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=createConfluencePage.d.ts.map