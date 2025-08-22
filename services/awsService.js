const AWS = require("aws-sdk");

// Feature flag to enable/disable AWS usage (default true). Set USE_AWS=false to disable.
const useAws = (process.env.USE_AWS || "true").toLowerCase() !== "false";

// Ensure region is configured (from env or fallback)
const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
AWS.config.update({ region: awsRegion });

const comprehendMedical = new AWS.ComprehendMedical();

async function analyzeMedicalText(text) {
  // Short-circuit if AWS is disabled or credentials are not present
  const hasCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) || !!process.env.AWS_SHARED_CREDENTIALS_FILE || !!process.env.AWS_PROFILE;
  if (!useAws || !hasCreds) {
    return [];
  }

  const params = { Text: text };
  const result = await comprehendMedical.detectEntitiesV2(params).promise();
  return result.Entities;
}

module.exports = { analyzeMedicalText };
