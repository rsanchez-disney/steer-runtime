# Process to Generate AI Metrics Report 
**You Should Follow These Steps in Order:**
1. If don't have "original Jira Ticket", Prompt for the Jira ticket number. This will be the "original Jira ticket".
2. If don't have PR, Prompt for the PR link for the change. 
3. Read the Description from Jira ticket.
4. Get this information from this Jira ticket:
        - "Story Points" (customfield_10003) 
        - "AI Assisted Effort" field (customfield_27200)
        - "AI Usage Level" field (customfield_27201)
        - "AI Tools Used" (customfield_27202, text)
5. Generate AI Metrics Report with the following items:
        - Calculated AI Impact Metrics based on step 11 and code change (Original Effort, AI Assisted Effort,Efficiency Gain , AI Usage Level)
        - Show details for the metric Efficiency Gain about What This Represents (Code, UT, Analysis,etc)
        - Identify Ticket Type based on code change and requirement from Jira ticket.
        - Calculate Final Ticket Variation for Analysis of the ticket, Coding process, Unit Testing process, Integration Testing process, Code Review process, Documentation process
        - Report must show only the items defined.
6. Post a comment in Jira Ticket with this information.




# RULES
*TICKET TYPE*
- New development (New Features)
- Bug Fixing (Incidents, Defects)
- Minor enhancement (Sustainment small changes)
- Modernization (Uplift, Refactoring, Modernization)
- Platform, Reliability and Ops (Automation Testing, PE testing, Performance, Infra)

*FINAL TICKET VARIATION EXPLAINED (AS PERCENTAGE)*
How much time you perceived you saved or lost using the AI tools mentioned above. 
- Values < 0: You saved time to develop this ticket due to the AI tools.
- Values > 0: You spent more time developing this ticket due to the AI tools.
- Values = 0: Your either didn't perceive impact using the tools or was not applicable at all to the ticket.