/**
 * Purpose: This script performs various post save actions on a Functional Requirement work item when the work item is saved.
 * 			- Calculates and sets the Risk Rating and Testing Type based on the Patient Risk and Implementation Complexity values.
 *
 * Author:	Jon Meuzelaar
 * Created: 7-July-2023
 *
 * CHANGE LOG
 *
 * v1.0 - Initial version
*/

// Log file setup
let scriptName = "WaterfallDev-functional_requirement-post-save"
let logFile = new java.io.FileWriter("./logs/main/workitemsave/" + scriptName + ".log", false); 
let logWriter = new java.io.BufferedWriter(logFile); 
let currentDateTime = new java.util.Date().toString();

// Main Business Logics Starts Here
try {

    let projectID = workItem.getProjectId();
    let workItemID = workItem.getId();
	let frPatientRisk;				// Stores Functional Requirement Patient Risk from the work item
	let frImplementationMethod;		// Stores Functional Requirement Implementation Complexity from the work item
	let calculatedRisk;				// Stores the integer risk value used to calculate the Risk Rating and Testing Type values
	let frRiskRating;				// Stores the Functional Requirement Risk Rating value calculated by this script
	let frTestingType;				// Stores the Functional Requirement Testing Type value calculted by this script
	

    logWriter.write(currentDateTime + "\t" + scriptName + ".js called on WorkItem ID: " + workItemID + " with Project ID: " + projectID + "\n");
	
	getFieldValues(workItem);
	calcRiskRating(workItem);
	workItem.save();
} 
catch (runtimeException) {
    logWriter.write(currentDateTime + "\tRuntime Exception Occured: \n" + runtimeException + "\n");
}
logWriter.flush();

/**
 * Gets the Risk Rating and Implementation enumeration IDs for a functional requirement.
 */
 function getFieldValues(iWorkItem){
	 try {
		 logWriter.write(currentDateTime + "\t" + "Getting Patient Risk and Implementation Method" + "\n");
		 frPatientRisk = String(iWorkItem.getCustomField("patientRisk").getId());			// Get the Patient Risk value from the requirement
		 logWriter.write(currentDateTime + "\t" + "Patient Risk value: " + frPatientRisk + "\n");
		 frImplementationMethod	= String(iWorkItem.getCustomField("implementationMethod").getId()); // Get the Implementation Complexity value from the requirement
		 logWriter.write(currentDateTime + "\t" + "Implementation Method value: " + frImplementationMethod + "\n");
	}
	 catch(runtimeException) {
		 logWriter.write(currentDateTime + "\t" + "Runtime Exception Occurred: \n" + runtimeException + "\n")
	 }
 }

/**
 * Calculates and sets the Risk Rating field value for a functional requirement
*/
function calcRiskRating(iWorkItem) {
	try {

		calculatedRisk = parseInt(frPatientRisk) * parseInt(frImplementationMethod);
		
		// Determine risk rating and testing type based on the calculatedRisk value
		switch(true) {
			case calculatedRisk >= 1 && calculatedRisk <= 2:
				frRiskRating = "low";
				frTestingType = "audit";
				break;
			case calculatedRisk >= 3 && calculatedRisk <= 5:
				frRiskRating = "medium";
				frTestingType = "unscripted";
				break;
			case calculatedRisk > 5:
				frRiskRating = "high";
				frTestingType = "scripted";
				break;
			default:
				frRiskRating = "unanalyzed";
				frTestingType = "unanalyzed";
		}
		
		logWriter.write(currentDateTime + "\t" + "Calculated Risk: " + calculatedRisk + "\n\t\t\t\t" + "Risk Rating: " + frRiskRating + "\n\t\t\t\t" + "Testing Type: " + frTestingType + "\n");
		iWorkItem.setEnumerationValue("riskRating", frRiskRating);
		iWorkItem.setEnumerationValue("testingType", frTestingType);
	}
	 catch(runtimeException) {
		 logWriter.write(currentDateTime + "\t" + "Error getting values: " + runtimeException + "\n")
	 }
}