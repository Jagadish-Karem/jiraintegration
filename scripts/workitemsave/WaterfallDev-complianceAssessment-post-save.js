/**
 * Purpose: This script performs various post save actions on a Compliance Assessment work item:
 *           - Assesses and sets the GxP and ERES Applicability values based on  gxp_* and 21cfr_* valuesreturnVal
 *           - Assesses and sets the Overall Risk Rating value based on the psi_*, pqi_*, dii_*, and systemGAMPCategory values
 *
 * Author:	Jon Meuzelaar
 * Created: 7-July-2023
 *
 * CHANGE LOG
 *
 * v1.0 - Initial version
*/

// Log file setup
let scriptName = "WaterfallDev-complianceAssessment-post-save"
let logFile = new java.io.FileWriter("./logs/main/workitemsave/" + scriptName + ".log", false); 
let logWriter = new java.io.BufferedWriter(logFile); 
let currentDateTime = new java.util.Date().toString();
let wiFields;                   // Array of all custom fields in the work item
let assessmentVerdict;

// Main Business Logics Starts Here
try {
    let projectID = workItem.getProjectId();
    let workItemID = workItem.getId();
	logWriter.write(currentDateTime + "\t" + scriptName + ".js called on WorkItem ID: " + workItemID + " with Project ID: " + projectID + "\n");
    
    // Add all the custom fields to an array.  This allows additions / removals of GxP and ERES questions without requiring script maintenance.
    wiFields = workItem.getCustomFieldsList().toArray();
    logWriter.write(currentDateTime + "\t" + wiFields.length + " custom fields returned.\n");

    // Assess and set the GxP Assessment value
    assessmentVerdict = updateAssessment("gxp_");
    logWriter.write(currentDateTime + "\tGxP Assessment Verdict: " + assessmentVerdict + "\n");
    workItem.setEnumerationValue("gxpApplicability", assessmentVerdict);

    // Assess and set the ERES Assessment value
    assessmentVerdict = updateAssessment("21cfr_");
    logWriter.write(currentDateTime + "\tERES Assessment Verdict: " + assessmentVerdict + "\n");
    workItem.setEnumerationValue("eresApplicability", assessmentVerdict);

    // Assess and set the PSI, PQI, DII, and ORR values
    assessmentVerdict = assessImpacts();
    logWriter.write(currentDateTime + "\tORR Assessment Verdict: " + assessmentVerdict + "\n");
    workItem.setEnumerationValue("overallRiskRating", assessmentVerdict);

    // Save the WI - no data changes from this script are committed without .save() being called.
    workItem.save();
}
catch(runtimeException) {
    logWriter.write(currentDateTime + "\t" + "Runtime Exception Occurred: " + runtimeException + "\n");
}
logWriter.flush();


/**
 * This function returns the verdict for a given suite of assessment fields
 */
function updateAssessment(assessmentField) {
    let unanalyzedCounter = 0;
    let yesCounter = 0;
    let noCounter = 0;
    let returnVal = "unanalyzed";

    logWriter.write(currentDateTime + "\tAssessing the " + assessmentField + " fields\n");
    // Get counts of verdicts for the specific assessment fields
    for (i in wiFields) {
        switch (true) {
            case wiFields[i].startsWith(assessmentField):
                if (workItem.getCustomField(wiFields[i]) === null) {
                    unanalyzedCounter = unanalyzedCounter + 1;
                }
                else if (workItem.getCustomField(wiFields[i]).getId() == "yes") {
                    yesCounter = yesCounter + 1;
                }
                else if (workItem.getCustomField(wiFields[i]).getId() == "no") {
                    noCounter = noCounter + 1;
                }
                break;
        }
    }
    logWriter.write("\t\tUnanalyzed: " + unanalyzedCounter + "\n\t\tYes: " + yesCounter + "\n\t\tNo: " + noCounter + "\n");

    // Analyze results and return verdict
    switch (true) {
        case parseInt(unanalyzedCounter) > 0:
            returnVal = "unanalyzed";
            break;
        case parseInt(yesCounter) > 0:
            returnVal = "yes";
            break;
        default:
            returnVal = "no";
            break;
    }
    logWriter.write("\t\t" + returnVal + "\n");
    return(returnVal);
}

/**
 * This function manages setting the PSI, PQI, DII, and ORR values
 */

function assessImpacts() {
    let psiVerdict;
    let pqiVerdict;
    let diiVerdict;
    let riskMultiplier;
    let calculatedRisk;
    let returnVal;

    // Assess and set the Patient Safety Impact value
    psiVerdict = updateAssessment("psi_");

    // Assess and set the Patient Safety Impact value
    pqiVerdict = updateAssessment("pqi_");

    // Assess and set the Patient Safety Impact value
    diiVerdict = updateAssessment("dii_");

    // Set the impact field values in the work item
    logWriter.write(currentDateTime + "\tPatient Safety Impact Verdict: " + psiVerdict + "\n");
    workItem.setEnumerationValue("patientSafetyImpact", psiVerdict);
    logWriter.write(currentDateTime + "\tProduct Quality Impact Verdict: " + pqiVerdict + "\n");
    workItem.setEnumerationValue("productQualityImpact", pqiVerdict);
    logWriter.write(currentDateTime + "\tData Integrity Impact Verdict: " + diiVerdict + "\n");
    workItem.setEnumerationValue("dataIntegrityImpact", diiVerdict);

    // Calculate the ORA
    // If any of the necessary values are unanalyzed, return the Overall Risk Rating as unanalyzed
    if (workItem.getCustomField("systemGAMPCategory").getId() == "unanalyzed" || workItem.getCustomField("patientSafetyImpact").getId() == "unanalyzed" || workItem.getCustomField("productQualityImpact").getId() == "unanalyzed" || workItem.getCustomField("dataIntegrityImpact").getId() == "unanalyzed") {
        logWriter.write(currentDateTime + "\tCannot assess ORA.\n")
        returnVal = "unanalyzed";
    }
    // Otherwise calculate the risk and return the Overall Risk Rating value
    else {
        // Set the risk multiplier value based on the assessment outcome
        switch (true) {
            case psiVerdict == "yes":
                riskMultiplier = 3;
                break;
            case pqiVerdict == "yes":
                riskMultiplier = 2;
                break;
            case diiVerdict == "yes":
                riskMultiplier = 1;
                break;
            default:
                riskMultiplier = 0;
                break;
        }

        calculatedRisk = parseInt(riskMultiplier) * parseInt(workItem.getCustomField("systemGAMPCategory").getId());
        logWriter.write(currentDateTime + "\tCalculated risk value: " + calculatedRisk + "\n");

        // Set the return value based on calculatedRisk ranges.  
        switch (true) {
            case parseInt(calculatedRisk) >= 1 && parseInt(calculatedRisk) <= 2:
                returnVal = "low";
                break;
            case calculatedRisk >= 3 && calculatedRisk <= 5:
                returnVal = "medium";
                break;
            case calculatedRisk > 5:
                returnVal = "high";
                break;
            default:
                returnVal = "low";
        }
    }
    return(returnVal);
}