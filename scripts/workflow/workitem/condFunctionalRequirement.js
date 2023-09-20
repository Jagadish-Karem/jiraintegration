/**
 * Purpose: This script performs ensures the Functional Requirement work item cannot be routed without 
 *          the Risk Rating and Testing Type values having been assessed.
 * 
 *          If all conditions are passed, the script returns true and the transition will be allowed.
 *          Otherwise, it wil return a string indicating which assessment(s) are incomplete and the 
 *          transition will be blocked.
 *
 * Author:	Jon Meuzelaar
 * Created: 7-July-2023
 *
 * CHANGE LOG
 *
 * v1.0 - Initial version
*/

// Set up the base object
let baseObject = workflowContext.getTarget();

// Log file setup
let scriptName = "condFunctionalRequirement"
let logFile = new java.io.FileWriter("./logs/main/workflow/" + scriptName + ".log", false); 
let logWriter = new java.io.BufferedWriter(logFile); 
let currentDateTime = new java.util.Date().toString();
let projectID = baseObject.getProjectId();
let objectID = baseObject.getId();
logWriter.write(currentDateTime + "\t" + scriptName + ".js called on Item ID: " + objectID + " with Project ID: " + projectID + "\n");

let riskRating = baseObject.getCustomField("riskRating").getId();
let testingType = baseObject.getCustomField("testingType").getId();
let returnVal;

if (riskRating == "unanalyzed" || testingType == "unanalyzed") {
    returnVal = "Blocked: Risk Rating and / or Testing Type not analyzed.";
}
else {
    returnVal = true;
}

returnVal;