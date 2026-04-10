export declare const commentOnConfluencePageSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            pageId: {
                type: string;
                description: string;
            };
            body: {
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
export declare function handleCommentOnConfluencePage(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=commentOnConfluencePage.d.ts.map