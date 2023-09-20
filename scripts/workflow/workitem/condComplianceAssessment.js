/**
 * Purpose: This script performs ensures the Compliance Assessment work item cannot be routed without 
 *          the appropriate assessments being done.  The minimum required assessments are the System
 *          GAMP Category and the GxP Applicabilty assessment.  If the GxP Applicability value is Yes,
 *          the remaining ERES, Patient Safety, Product Quality, Data Integrity, and Overall Risk Rating 
 *          assessments are required to have values other than Unanalyzed.
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
let scriptName = "condComplianceAssessment"
let logFile = new java.io.FileWriter("./logs/main/workflow/" + scriptName + ".log", false); 
let logWriter = new java.io.BufferedWriter(logFile); 
let currentDateTime = new java.util.Date().toString();
let projectID = baseObject.getProjectId();
let objectID = baseObject.getId();
logWriter.write(currentDateTime + "\t" + scriptName + ".js called on Item ID: " + objectID + " with Project ID: " + projectID + "\n");

// Set up all the variables used to check conditions.
let returnVal;
let incompleteAssessments = "";
let systemGAMPCategory = baseObject.getCustomField("systemGAMPCategory").getId();
let gxpApplicability = baseObject.getCustomField("gxpApplicability").getId();
let eresApplicability = baseObject.getCustomField("eresApplicability").getId();
let patientSafetyImpact = baseObject.getCustomField("patientSafetyImpact").getId();
let productQualityImpact = baseObject.getCustomField("productQualityImpact").getId();
let dataIntegrityImpact = baseObject.getCustomField("dataIntegrityImpact").getId();
let overallRiskRating = baseObject.getCustomField("overallRiskRating").getId();

// Log current values for troubleshooting purposes.
logWriter.write("\t\tSystem GAMP Category: " + systemGAMPCategory + "\n")
logWriter.write("\t\tGxP Assessment Value: " + gxpApplicability + "\n");
logWriter.write("\t\tERES Assessment Value: " + eresApplicability + "\n");
logWriter.write("\t\tPSI Assessment Value: " + patientSafetyImpact + "\n");
logWriter.write("\t\tPQI Assessment Value: " + productQualityImpact + "\n");
logWriter.write("\t\tDII Assessment Value: " + dataIntegrityImpact + "\n");
logWriter.write("\t\tORR Assessment Value: " + overallRiskRating + "\n");
logWriter.flush();

// Start with the GAMP category - if it is not filled, no other assessments would have been calculated.
if (systemGAMPCategory != "unanalyzed") {

    // If the system has GxP applicability or is incomplete, check the other assesssments.
    switch (gxpApplicability) {
        case "unanalyzed":  // No value therefore transition cannot occur.
            returnVal = "Blocked: GxP Applicability is unanalyzed.";
            break;
        case "no":  // No GxP Applicability therefore other assessments are not required.
            returnVal = true;
            break;
        case "yes": // GxP Applicability, therefore check the remaining assessments.
            if (eresApplicability == "unanalyzed") {
                incompleteAssessments = "\tERES Applicability\n";
            } 
            if (patientSafetyImpact == "unanalyzed") {
                incompleteAssessments = incompleteAssessments + "\tPatient Safety Impact\n";
            }
            if (productQualityImpact == "unanalyzed") {
                incompleteAssessments = incompleteAssessments + "\tProduct Quality Impact\n";
            }
            if (dataIntegrityImpact == "unanalyzed") {
                incompleteAssessments = incompleteAssessments + "\tData Integrity Impact\n";
            } 
            if (overallRiskRating == "unanalyzed") {
                incompleteAssessments = incompleteAssessments + "\tOverall Risk Rating\n";
            }
            
            if (incompleteAssessments == "") {
                returnVal = true;
            }
            else {
                returnVal = "Blocked: The following assessments are incomplete:\n\n" + incompleteAssessments;
            }
            break;        
    }
}
else {
    returnVal = "Blocked: System GAMP Category is unanalyzed."
}

returnVal;