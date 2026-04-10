export declare const searchConfluencePagesSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            cql: {
                type: string;
                description: string;
            };
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
        required: string[];
    };
};
export declare function handleSearchConfluencePages(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=searchConfluencePages.d.ts.map