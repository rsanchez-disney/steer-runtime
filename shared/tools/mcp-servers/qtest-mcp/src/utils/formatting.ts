import type {
  QtestProject,
  QtestTestCase,
  QtestTestRun,
  QtestTestCycle,
  QtestTestSuite,
  QtestRequirement,
  QtestDefect,
} from "./types.js";

export function formatProjects(projects: QtestProject[]): string {
  let output = `**qTest Projects**\n\n**Total Projects:** ${projects.length}\n\n`;
  projects.forEach((project, i) => {
    output += `**${i + 1}. [${project.id}] ${project.name}**\n- Description: ${project.description}\n\n`;
  });
  return output;
}

export function formatTestCase(tc: QtestTestCase): string {
  let output = `**Test Case: [${tc.pid}] ${tc.name}**\n- ID: ${tc.id}\n- Description: ${tc.description}\n- Precondition: ${tc.precondition}\n`;
  if (tc.test_steps && tc.test_steps.length > 0) {
    output += `**Test Steps:**\n`;
    tc.test_steps.forEach((step) => {
      output += `  ${step.order}. ${step.description} → Expected: ${step.expected}\n`;
    });
  }
  return output;
}

export function formatTestRun(tr: QtestTestRun): string {
  return `**Test Run: ${tr.name}**\n- ID: ${tr.id}\n- Status: ${tr.status}\n- Assigned To: ${tr.assigned_to}\n- Test Case: [${tr.test_case.id}] ${tr.test_case.name}\n`;
}

export function formatTestCycles(cycles: QtestTestCycle[]): string {
  let output = `**Test Cycles** (${cycles.length})\n\n`;
  cycles.forEach((cycle) => {
    output += `**[${cycle.pid}] ${cycle.name}**\n- ID: ${cycle.id}\n- Description: ${cycle.description}\n\n`;
  });
  return output;
}

export function formatTestSuites(suites: QtestTestSuite[]): string {
  let output = `**Test Suites** (${suites.length})\n\n`;
  suites.forEach((suite) => {
    output += `**${suite.name}**\n- ID: ${suite.id}\n- Description: ${suite.description}\n- Test Cycle ID: ${suite.test_cycle_id}\n\n`;
  });
  return output;
}

export function formatRequirements(reqs: QtestRequirement[]): string {
  let output = `**Requirements** (${reqs.length})\n\n`;
  reqs.forEach((req) => {
    output += `**[${req.pid}] ${req.name}**\n- ID: ${req.id}\n- Description: ${req.description}\n`;
    if (req.linked_test_cases && req.linked_test_cases.length > 0) {
      const linked = req.linked_test_cases.map((tc) => tc.pid ? `[${tc.pid}] ${tc.name}` : `${tc.id}: ${tc.name}`).join(", ");
      output += `- Linked Test Cases (${req.linked_test_cases.length}): ${linked}\n`;
    }
    output += `\n`;
  });
  return output;
}

export function formatDefects(defects: QtestDefect[]): string {
  let output = `**Defects** (${defects.length})\n\n`;
  defects.forEach((defect) => {
    output += `**${defect.summary}**\n- ID: ${defect.id}\n- Status: ${defect.status}\n- Description: ${defect.description}\n- Linked Test Run: ${defect.linked_test_run_id}\n\n`;
  });
  return output;
}
