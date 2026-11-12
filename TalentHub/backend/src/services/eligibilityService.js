const checkEligibility = (student, job) => {
  const reasons = [];
  let isEligible = true;

  if (job.minCgpa > 0) {
    if (student.cgpa === null || student.cgpa === undefined) {
      isEligible = false;
      reasons.push('CGPA not set in profile');
    } else if (student.cgpa < job.minCgpa) {
      isEligible = false;
      reasons.push(`CGPA ${student.cgpa} is below minimum required ${job.minCgpa}`);
    }
  }

  const studentBacklogs = student.activeBacklogs || 0;
  if (studentBacklogs > job.maxBacklogs) {
    isEligible = false;
    reasons.push(`Active backlogs (${studentBacklogs}) exceed maximum allowed (${job.maxBacklogs})`);
  }

  const eligibleBranches = Array.isArray(job.eligibleBranches) ? job.eligibleBranches : [];
  if (eligibleBranches.length > 0) {
    if (!student.branch) {
      isEligible = false;
      reasons.push('Branch not set in profile');
    } else {
      const normalizedStudentBranch = student.branch.trim().toUpperCase();
      const normalizedBranches = eligibleBranches.map(b => b.trim().toUpperCase());
      if (!normalizedBranches.includes(normalizedStudentBranch)) {
        isEligible = false;
        reasons.push(`Branch '${student.branch}' is not eligible. Eligible: ${eligibleBranches.join(', ')}`);
      }
    }
  }

  return {
    isEligible,
    reasons,
    message: isEligible ? 'Student meets all eligibility criteria' : `Not eligible: ${reasons.join('; ')}`,
  };
};

module.exports = { checkEligibility };
