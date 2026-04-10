export declare const updateConfluencePageSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            pageId: {
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
            version: {
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
export declare function handleUpdateConfluencePage(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=updateConfluencePage.d.ts.map