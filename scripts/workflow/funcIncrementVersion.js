/**
 * Purpose: This script increments the Version number for the work item or document when an action is called.
 *			It can be used to update a major (1.x) or minor (x.1) version by changing the incrementValue
 *			argument used when the script is called.
 *
 * Author:	Jon Meuzelaar
 * Created: 10-July-2023
 *
 * CHANGE LOG
 *
 * v1.0 - Initial version
*/

// Log file setup
let scriptName = "funcIncrementVersion";
let logFile = new java.io.FileWriter("./logs/main/workflow/" + scriptName + ".log", false); 
let logWriter = new java.io.BufferedWriter(logFile); 
let currentDateTime = new java.util.Date().toString();


// Set up basic objects and variables for script
let baseObject =  workflowContext.getTarget();
let versionFieldID = arguments.getAsString("versionFieldID");
let incrementValue = arguments.getAsString("incrementValue");
let projectID = baseObject.getProjectId();
let oldVersion= baseObject.getValue("version");
let newVersion = ""; 
logWriter.write(currentDateTime + "\t" + scriptName + " called for " + projectID + "\n"); logWriter.flush();

// Log collected information
logWriter.write(currentDateTime + "\t" + "Item ID: " + baseObject.getId() + "\n"); logWriter.flush();
logWriter.write("\t\t\t\t" + "Action: " + workflowContext.getActionId() + "\n");  logWriter.flush();
logWriter.write("\t\t\t\t" + "Target Status: " + workflowContext.getTargetStatusId() + "\n"); logWriter.flush();
logWriter.write("\t\t\t\t" + "Type: " + baseObject.getType() + "\n"); logWriter.flush();
logWriter.write("\t\t\t\t" + "Version: " + oldVersion + "\n"); logWriter.flush();

// If the existing Version field is blank, null, or not a number, set it to 1.0, otherwise add the incrementValue
if (oldVersion == "" || oldVersion == null || oldVersion == NaN)
{
	 newVersion = 1.0;
}
 else
{
	 newVersion = parseFloat(oldVersion) + parseFloat(incrementValue);
} 

baseObject.setCustomField(versionFieldID, newVersion.toFixed(1).toString());
logWriter.write(currentDateTime + "\t" + "Updated Version from " + oldVersion + " to " + newVersion + "\n"); logWriter.flush();

logWriter.close();