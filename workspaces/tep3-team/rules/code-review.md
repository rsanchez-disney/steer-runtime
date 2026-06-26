# Process to Create a Pull Request


**If creating a brand new pull request, you should follow these steps in order:**

1. Prompt for the Jira ticket number. This will be the "original Jira ticket".
2. The Jira ticket may be a "Task" type. Use jira_search with the provided Jira ticket and "implements" linked issues.
    - Then, if there is an "implements" linked issue of type "Story", read the Description from this Jira ticket instead to get the technical requirements.
    - Otherwise, continue using the original Jira ticket.
3. Create a branch with the name of the original Jira ticket number if a branch containing the original Jira ticket number does not exist. Don't include checking remote branches.
4. Display the file changes that have been made locally and prompt me to confirm which changes to include in the PR. Do not stage any empty files. Ignore the untracked files.
5. Add the confirmed changes to the new branch (do not commit the files I did not approve), commit the changes, and push to the new branch. Do not commit the files I did not approve. There should not be any empty files from the files I didn't approve.
6. Run Maven Clean Verify to validate the project can build successfully.
    - If there is an .sdkmanrc file in the repo, run sdk env to ensure you're using the correct java and Maven versions. You'll need to source the sdkman-init.sh as well, but should not need to install sdk env.
    - Some tests may require the AWS_REGION variable to be set. Please set this to us-west-2 before running the Maven command.
    - If issues occur (including errors or test failures), list all the issues.
        - For each issue, ask if I want to address or skip.
        - If I choose to address the issue, then:
            - Show me the proposed code changes, but do not make any changes to the code until I have approved it.
            - Refine with my feedback; never assume approval without explicit confirmation.
        - Only proceed when I have confirmed that all issues have been addressed.
        - Once all issues are addressed, prompt to see if we should run step 6 again to confirm the project can now build without issues
7. Prompt for the target branch.
8. Prompt if this is a forked repo or not.
    - If it is a forked repo
        - Prompt for the owner of the repo. Offer to check the upstream to help get the owner of the repo.
        - Make sure the upstream has been fetched so we have the most recent version.
    - If it is not a forked repo, the owner referred to from here out will be the current owner
        - Make sure the target branch has been fetched so we have the most recent version.
9. Merge the current branch onto the target owner's branch
    - If Code Conflicts occur, prompt me to review and fix the conflicts before continuing
10. Review the code changes that were made in the new branch compared to the target owner's branch.
    - Look for:
        - Null and Null pointer exception handling (Look for potential null dereferences and ensure proper checks are in place.)
        - Important: Missing unit tests
        - Code style consistency
        - Proper error handling and propagation
        - Adequate test coverage
        - Clear and concise comments
        - Security issues
        - Missing logging
    - Surface unclear points and ask clarifying questions.
    - If issues are found, list all the issues.
    - For each issue, ask if I want to address or skip.
    - If I choose to address the issue, then:
        - Show me the proposed code changes, but do not make any changes to the code until I have approved it.
        - Refine with my feedback; never assume approval without explicit confirmation.
    - Only proceed when I have confirmed that all issues have been addressed.
11. Use create_pull_request to create a draft pull request with the changes from the new branch to the target owner's branch.
    - Then follow these sub-steps to fill in the PR details:
      - Important: Use jira_get_issue to get the title and description of the Jira ticket.
      - Use the title from the original Jira ticket.
      - Use the description from the "Story" type Jira ticket if applicable from Step 2. Otherwise, use the description from the original Jira ticket.
        - Search the pull request template file located in the Kiro workspace rules folder (pull_request_template.md).
        - In the PR, follow the format in PULL_REQUEST_TEMPLATE.md. Automatically fill in the details in the PR when I open the link, using details from the Jira ticket, the template, and the code.
        - Don't include the improvements we made together from Step 10 in the PR description.
        - If there is no pull request template file, use the details from the Jira ticket and the code to describe what was changed, how it was tested, and any other relevant information.
12. Use create_pending_pull_request_review.
13. Then, with the title "Review by Kiro", provide 1 single detailed review of the code changes, including:
    - Identification of any potential bugs or issues.
    - Suggestions for improvements or best practices.
    - Any missing tests or documentation.
    - Approval or rejection of the pull request with reasons. Usually, reject if there are any bugs, issues, or missing tests, documentation.
    - Use `add_comment_to_pending_review` to add your review comment to the pull request. Do not submit the review.
14. Update the original Jira ticket:
    - Use jira_update_issue to add the link to the PR in the "Pull Request" (customfield_21707 field) section of the Jira ticket, or if not available, the "Evidence of Completion" (customfield_20800 field) section of the Jira ticket.
    - Use jira_transition_issue to move the Jira ticket to the "Ready for Review" status, or "In Review" if not available, or "Peer Review" if not available.
    - Use jira_add_comment to add a comment to the Jira ticket indicating that the PR has been created and is ready for review.
    - Use jira_update_issue to add the "AI-Peer-Reviewed" label to the Labels section of the Jira ticket.
    - Use jira_update_issue to add "Kiro" to the "AI Tools Used" (customfield_27202, text) field of the Jira ticket.
15. Prompt the user for AI metrics and update the Jira ticket:
    - Ask the user what the new actual effort/complexity for this ticket is with the help of AI (AI Assisted Effort).
        - Use jira_get_issue to remind the user how many points were listed in the "Story Points" (customfield_10003) field as a reference in the "Task" type Jira ticket.
        - Use jira_update_issue to update the "AI Assisted Effort" field (customfield_27200) with this value.
    - Ask the user for the AI Usage Level: Low, Medium, High, where Low: Primarily human effort with AI for specific tasks (research, boilerplate, etc.); Medium: Balanced collaboration between human judgment and AI assistance; High: AI-driven approach with human oversight and refinement.
        - Use jira_update_issue to update the "AI Usage Level" field (customfield_27201) with this value.
16. Open the PR link in the user's browser.

**If user asks to update their pull request, you should follow these steps in order:**
1. Display the file changes that have been made locally and prompt me to confirm which changes to include in the PR. Do not stage any empty files. Ignore the untracked files.
2. Review the code changes that were made compared to the target branch.
    - Look for:
        - Null and Null pointer exception handling (Look for potential null dereferences and ensure proper checks are in place.)
        - Important: Missing unit tests
        - Code style consistency
        - Proper error handling and propagation
        - Adequate test coverage
        - Clear and concise comments
        - Security issues
        - Missing logging
        - Code conflicts
    - Surface unclear points and ask clarifying questions.
    - If issues are found, go through each of them with me one by one.
    - For each issue, ask if I want to address or skip.
    - If I choose to address the issue, then:
        - Show me the proposed code changes, but do not make any changes to the code until I have approved it.
        - Refine with my feedback; never assume approval without explicit confirmation.
    - Only proceed when I have confirmed that all issues have been addressed.
3. Add the confirmed changes to the branch (do not commit the files I did not approve), commit the changes, and push to the new branch. Do not commit the files I did not approve. There should not be any empty files from the files I didn't approve.
4. Run Maven Clean Verify to validate the project can build successfully.
    - If there is an .sdkmanrc file in the repo, run sdk env to ensure you're using the correct java and Maven versions.
    - Some tests may require the AWS_REGION variable to be set. Please set this to us-west-2 before running the Maven command.
    - If issues occur (including errors or test failures), list all the issues.
        - For each issue, ask if I want to address or skip.
        - If I choose to address the issue, then:
            - Show me the proposed code changes, but do not make any changes to the code until I have approved it.
            - Refine with my feedback; never assume approval without explicit confirmation.
        - Only proceed when I have confirmed that all issues have been addressed.
        - Once all issues are addressed, prompt to see if we should run step 4 again to confirm the project can now build without issues
