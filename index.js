// Packages
const fs = require('fs');
const CSV = require("comma-separated-values");

// CSVs
const fileRead = (fileName) => {
	const x = fs.readFileSync(fileName).toString();
	return new CSV(x, { header: true }).parse();
};
const Courses = fileRead('courses.csv');
const Marks = fileRead('marks.csv');
const Students = fileRead('students.csv');
const Tests = fileRead('tests.csv');

// Gets course/subject table from CSV
const getCourse = test_id => Tests.find(test => test.id === test_id);
const getSubject = course_id => Courses.find(course => course.id === course_id);

/* 	
 * 	Creates an array of arrays of all the students' final grades for each subject,
 *	sorted by Course ID. Will break if any students have 0 test grades to their profile. 
 *	
 *	Example output: 
 *	[
 *		["1",96],
 *		["2",92.5],
 *		["3",75.14]
 *	]
 */
const studentMarks = id => {
	let scores = Marks.filter(test => test.student_id === id);
	let subjectScores = {};

	for (let { test_id, mark } of scores) {
		let { course_id, weight } = getCourse(test_id);	

		if (!subjectScores[course_id]) subjectScores[course_id] = 0;
		subjectScores[course_id] += mark * weight / 100;
	}
	return Object.entries(subjectScores).sort((a,b) => a[0] - b[0]);
};

/*
 *	Creates report cards for each student profile, based on the students
 *	stated in 'students.csv', sorted by student ID. Compiles an array of 
 *	course_id's to their course grade. Subject grades and total average 
 *	are rounded to 2 decimal places.
 */ 
const sortedStudents = Students.sort((a,b) => a.id - b.id);

const report_cards = sortedStudents.map((student) => {
	const scores = studentMarks(student.id);

	const total_average = scores
		.map(course_grade => course_grade[1])
		.reduce((sum,i) => sum+i ) / scores.length;

	const allGrades = scores.map( ([course_id,grade]) => {
		let {name:subject, teacher} = getSubject(Number(course_id));
		return `	Course: ${subject}, Teacher: ${teacher}
	Final Grade:	${grade.toFixed(2)}%`;
	}).join('\n\n');

	return `Student Id: ${student.id}, name: ${student.name}
Total average:	${total_average.toFixed(2)}%\n\n${allGrades}`;

}).join('\n\n\n\n');

// Writes the report cards (.txt format) to 'report_cards.txt'
fs.writeFileSync('report_cards.txt', report_cards);
console.log("Output file created, under report_cards.txt");
