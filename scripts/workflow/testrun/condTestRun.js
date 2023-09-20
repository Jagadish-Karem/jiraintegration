/**
 * Purpose: This script performs ensures all test cases within a formal test run meet the conditions
 * 			defined by each function.
 * 
 *          If all conditions are passed, the script returns true and the transition will be allowed.
 *          Otherwise, it wil return a string indicating why the condition check failed and the transition
 * 			will be blocked.
 *
 * Author:	Jon Meuzelaar
 * Created: 7-July-2023
 *
 * CHANGE LOG
 *
 * v1.0 - Initial version
*/

// Set up the base object and get arguments
let testRun = workflowContext.getTarget();
let actionID = testRun.getStatus().getId();
let returnVal;

//Log setup
let scriptName = "condTestRun_sendForApproval";
let logFile = new java.io.FileWriter("./logs/main/workflow/" + scriptName + ".log", false); 
let logWriter = new java.io.BufferedWriter(logFile); 
let currentDateTime = new java.util.Date().toString();
let projectID = testRun.getProjectId();
let objectID = testRun.getId();
logWriter.write(currentDateTime + "\t" + scriptName + ".js called on Test Run ID: " + objectID + " with Project ID: " + projectID + "\n");


try{	
	// Determine which function to execute based on the actionID
	switch (actionID) {
		case "in_draft":
		case "pre_approval":
			returnVal = preApproval();
			break;
		case "ready_for_exec":
		case "post_approval":
			returnVal = postApproval();
			break;
		default:
			returnVal = "Blocked: action not in list.";
	}
}
catch (e) {
    logWriter.write(currentDateTime + "\tRuntime Error Occured:\n " + e + "\n");
	returnVal = "Something went wrong. Please try again, if the error still exists please contact the Administrator.";
}
logWriter.flush();

/**
 * This function is used for the pre-execution approval process.  It verifies that the test cases have
 * been approved.  If any one test case is not approved, the transition will be blocked.
 */
function preApproval() {

	let records = testRun.getAllRecords();
	let tcStatus;
	let tcID;

	// Check approval status of all test cases.
	logWriter.write(currentDateTime + "\tCurrent test case status values:\n");
	if (records.size() > 0) {
			for(let i=0; i<records.size(); i++) {
				tcID = records.get(i).getTestCase().getId();
				tcStatus = records.get(i).getTestCase().getStatus();
				logWriter.write("\t\t" + tcID + ": " + tcStatus.getName() + "\n");
				if(tcStatus.getId() == "approved") {
					returnVal = true;
				}
				else {
					returnVal = "Blocked: One or more test cases are not approved.";
					break;
				}
			}
	}

	return returnVal;
}

/**
 * This function is used for post-execution review process. It verifies that all test cases have been executed.
 * If any test case does not have an associated run record, the transition will be blocked.
 */
function postApproval() {
	let records = testRun.getAllRecords();
	let tcID;

	logWriter.write(currentDateTime + "\tCurrent test case execution status values:\n");
	if (records.size() > 0) {
		for(let i=0; i < records.size(); i++) {
			// Check if the record is planned (i.e. not execution) or paused (i.e. incomplete)
			tcID = records.get(i).getTestCase().getId();
			if (records.get(i).isPaused() || records.get(i).isPlanned()) {
				logWriter.write("\t\tTest Case ID: (Paused: " + records.get(i).isPaused() + ") or (Planned: " + records.get(i).isPlanned() + ")\n")
				returnVal = "Blocked: One or more test cases are paused or not executed.";
				break;
			}
			else {
				returnVal = true;
			}
		}
	}

	return returnVal;
}

returnVal;