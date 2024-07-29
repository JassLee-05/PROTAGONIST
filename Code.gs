function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function getTasks() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
    if (!sheet) throw new Error('Tasks sheet not found');
    const data = sheet.getDataRange().getValues();
    Logger.log('Tasks data: ' + JSON.stringify(data)); // Log retrieved data
    const tasks = data.slice(1).map(row => `ID: ${row[0]}, Description: ${row[1]}, Assigned To: ${row[4]}`);
    return tasks;
  } catch (error) {
    Logger.log('Error in getTasks: ' + error.message);
    return ['Error loading tasks'];
  }
}

function getEmployees() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employees');
    if (!sheet) throw new Error('Employees sheet not found');
    const data = sheet.getDataRange().getValues();
    Logger.log('Employees data: ' + JSON.stringify(data)); // Log retrieved data
    const employees = data.slice(1).map(row => ({
      name: row[0],
      skills: row[1],
      availability: row[2],
      department: row[3],
      position: row[4],
      location: row[5],
      projectHistory: row[6],
      certifications: row[7]
    }));
    return employees;
  } catch (error) {
    Logger.log('Error in getEmployees: ' + error.message);
    return ['Error loading employees'];
  }
}

function searchEmployees(query) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employees');
    if (!sheet) throw new Error('Employees sheet not found');
    const data = sheet.getDataRange().getValues();
    Logger.log('Employees data: ' + JSON.stringify(data)); // Log retrieved data
    const employees = data.slice(1).filter(row => {
      return Object.values(row).some(cell => cell.toString().toLowerCase().includes(query.toLowerCase()));
    }).map(row => ({
      name: row[0],
      skills: row[1],
      availability: row[2],
      department: row[3],
      position: row[4],
      location: row[5],
      projectHistory: row[6],
      certifications: row[7]
    }));
    return employees;
  } catch (error) {
    Logger.log('Error in searchEmployees: ' + error.message);
    return ['Error searching employees'];
  }
}

function autoAssignTasks() {
  try {
    const tasksSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
    const employeesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employees');
    
    if (!tasksSheet || !employeesSheet) {
      Logger.log('Error: Sheets not found.');
      return;
    }
    
    const tasksRange = tasksSheet.getDataRange();
    const tasksValues = tasksRange.getValues();
    const employeesRange = employeesSheet.getDataRange();
    const employeesValues = employeesRange.getValues();
    
    Logger.log('Tasks values: ' + JSON.stringify(tasksValues));
    Logger.log('Employees values: ' + JSON.stringify(employeesValues));
    
    for (let i = 1; i < tasksValues.length; i++) {
      if (!tasksValues[i][4]) { // Check if task is not yet assigned
        const taskDescription = tasksValues[i][1].toLowerCase().trim();
        const taskPriority = tasksValues[i][2];
        
        Logger.log(`Processing task ${i}: ${taskDescription}`);
        
        let selectedEmployeeIndex = -1;
        let minAssignedTasks = Infinity;
        
        for (let j = 1; j < employeesValues.length; j++) {
          const employeeAvailability = employeesValues[j][2];
          const employeeAssignedTasksCount = employeesValues[j][3];
          const employeeSkills = employeesValues[j][1].toLowerCase().split(',').map(skill => skill.trim());
          
          Logger.log(`Checking employee ${j}: Availability: ${employeeAvailability}, Assigned Tasks: ${employeeAssignedTasksCount}, Skills: ${employeeSkills}`);
          
          if (employeeAvailability > 0 && employeeAssignedTasksCount < minAssignedTasks && employeeSkills.includes(taskDescription)) {
            selectedEmployeeIndex = j;
            minAssignedTasks = employeeAssignedTasksCount;
            Logger.log(`Selected employee ${j} for task ${i}`);
          }
        }
        
        if (selectedEmployeeIndex !== -1) {
          tasksValues[i][4] = employeesValues[selectedEmployeeIndex][0]; // Assign task
          employeesValues[selectedEmployeeIndex][3]++; // Increment assigned tasks count
          
          tasksSheet.getRange(i + 1, 5).setValue(tasksValues[i][4]); // Update Assigned To in Tasks Sheet
          employeesSheet.getRange(selectedEmployeeIndex + 1, 4).setValue(employeesValues[selectedEmployeeIndex][3]); // Update Assigned Tasks Count in Employees Sheet
          
          Logger.log(`Task ${i} assigned to employee ${selectedEmployeeIndex}`);
        } else {
          Logger.log(`No suitable employee found for task ${i}`);
        }
      }
    }
  } catch (error) {
    Logger.log('Error in autoAssignTasks: ' + error.message);
  }
}

function getRequirementTemplates() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Templates');
    if (!sheet) throw new Error('Templates sheet not found');
    const data = sheet.getDataRange().getValues();
    Logger.log('Templates data: ' + JSON.stringify(data)); // Log retrieved data
    const templates = data.slice(1).map(row => ({
      position: row[0],
      requirements: row[1]
    }));
    return templates;
  } catch (error) {
    Logger.log('Error in getRequirementTemplates: ' + error.message);
    return ['Error loading templates'];
  }
}

function parseResumesAndScoreCandidates(resumes) {
  // Placeholder for AI-powered resume parsing logic
  return resumes.map((resume, index) => ({
    candidate: resume,
    score: Math.floor(Math.random() * 100) + 1  // Mock score between 1 and 100
  }));
}

function getQualifiedCandidates(requirements) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Candidates');
    if (!sheet) throw new Error('Candidates sheet not found');
    const data = sheet.getDataRange().getValues();
    Logger.log('Candidates data: ' + JSON.stringify(data)); // Log retrieved data
    const candidates = data.slice(1).map(row => ({
      name: row[0],
      resume: row[1]
    }));
    
    const scoredCandidates = parseResumesAndScoreCandidates(candidates.map(candidate => candidate.resume));
    const qualifiedCandidates = scoredCandidates.filter(candidate => candidate.score >= 70); // Example threshold score
    
    return qualifiedCandidates.map(candidate => ({
      name: candidates[scoredCandidates.indexOf(candidate)].name,
      score: candidate.score
    }));
  } catch (error) {
    Logger.log('Error in getQualifiedCandidates: ' + error.message);
    return ['Error loading candidates'];
  }
}

function addEmployee(employee) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Employees');
    if (!sheet) throw new Error('Employees sheet not found');
    
    sheet.appendRow([
      employee.name, 
      employee.skills, 
      employee.availability, 
      employee.department, 
      employee.position, 
      employee.location, 
      employee.projectHistory, 
      employee.certifications
    ]);
    
    return 'Employee added successfully';
  } catch (error) {
    Logger.log('Error in addEmployee: ' + error.message);
    return 'Error adding employee';
  }
}

function addRequirementTemplate(template) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Templates');
    if (!sheet) throw new Error('Templates sheet not found');
    
    sheet.appendRow([template.position, template.requirements]);
    
    return 'Requirement template added successfully';
  } catch (error) {
    Logger.log('Error in addRequirementTemplate: ' + error.message);
    return 'Error adding requirement template';
  }
}

function addCandidate(candidate) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Candidates');
    if (!sheet) {
      throw new Error('Candidates sheet not found');
    }
    sheet.appendRow([candidate.name, candidate.resume]);
    return 'Candidate added successfully!';
  } catch (error) {
    Logger.log('Error in addCandidate: ' + error.message);
    return 'Error adding candidate: ' + error.message;
  }
}

function getCandidates() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Candidates');
    if (!sheet) throw new Error('Candidates sheet not found');
    const data = sheet.getDataRange().getValues();
    Logger.log('Candidates data: ' + JSON.stringify(data)); // Log retrieved data
    const candidates = data.slice(1).map(row => ({ name: row[0], resume: row[1] }));
    return candidates;
  } catch (error) {
    Logger.log('Error in getCandidates: ' + error.message);
    return ['Error loading candidates'];
  }
}


// Submit an employee-initiated training request
function submitTrainingRequest() {
    const request = {
        employeeName: document.getElementById('trainingRequestEmployee').value,
        details: document.getElementById('trainingRequestDetails').value
    };
    google.script.run.withSuccessHandler((message) => {
        alert(message);
        clearTrainingRequestForm();
    }).submitTrainingRequest(request);
}

// Clear the training request form
function clearTrainingRequestForm() {
    document.getElementById('trainingRequestEmployee').value = '';
    document.getElementById('trainingRequestDetails').value = '';
}

function getTrainingRecommendations() {
  // Example data. Replace with actual data retrieval logic.
  return [
    { title: 'Advanced JavaScript', description: 'Deep dive into JavaScript.', skills: ['JavaScript', 'Web Development'] },
    { title: 'Project Management', description: 'Best practices in project management.', skills: ['Management', 'Leadership'] }
  ];
}

function addCertification(certification) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Certifications");
  sheet.appendRow([certification.name, certification.employeeName, certification.expirationDate]);
  return 'Certification added successfully.';
}

function submitTrainingRequest(request) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TrainingRequests');
    if (!sheet) throw new Error('TrainingRequests sheet not found');
    
    // Append new request data to the sheet
    const newRow = [request.employeeName, request.details, new Date()];
    sheet.appendRow(newRow);
    
    Logger.log('Training request submitted: ' + JSON.stringify(request)); // Log submitted request
    return 'Training request submitted successfully!';
  } catch (error) {
    Logger.log('Error in submitTrainingRequest: ' + error.message);
    return 'Error submitting training request';
  }
}

// Function to get leave requests from the sheet
function getLeaveRequests() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leave');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const result = rows.map(row => {
    const request = {};
    headers.forEach((header, index) => {
      request[header] = row[index];
    });
    return request;
  });

  Logger.log(result); // Log the result to check if data is being returned
  return result;
}

// Function to submit a leave request
function submitLeaveRequest(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leave');

  // Validate email
  if (!validateEmail(data.email)) {
    return 'Invalid email address.';
  }

  // Append the leave request data to the sheet
  const row = [
    data.name,
    data.email,
    data.leaveType,
    data.startDate,
    data.endDate,
    'Pending'
  ];
  sheet.appendRow(row);

  // Send email notification
  try {
    MailApp.sendEmail({
      to: data.email,
      subject: 'Leave Request Submitted',
      body: `Hello ${data.name},\n\nYour leave request from ${data.startDate} to ${data.endDate} has been received and is currently under review.\n\nBest regards,\nYour Company`
    });
    return 'Leave request submitted successfully!';
  } catch (error) {
    Logger.log('Failed to send email: ' + error.message);
    return 'Failed to submit leave request. Please try again.';
  }
}

// Function to handle request approval or rejection
function handleRequest(action, email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leave');
  const data = sheet.getDataRange().getValues();
  
  // Iterate through rows to find matching email
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && data[i][5] === 'Pending') {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      sheet.getRange(i + 1, 6).setValue(status); // 6th column is Status
      
      // Send notification email to employee
      try {
        MailApp.sendEmail({
          to: email,
          subject: `Leave Request ${status}`,
          body: `Hello ${data[i][0]},\n\nYour leave request from ${data[i][3]} to ${data[i][4]} has been ${status}.\n\nBest regards,\nYour Company`
        });
        return `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`;
      } catch (error) {
        Logger.log('Failed to send email: ' + error.message);
        return 'Failed to send notification email. Please try again.';
      }
    }
  }
  
  return 'Request not found.';
}

// Function to validate email address
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}