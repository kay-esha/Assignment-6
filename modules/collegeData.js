const Sequelize = require('sequelize');

var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'OEP5Ylc9NGaq', { 
    host: 'ep-dry-unit-a5oikjlq-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: { 
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define the relationship
Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("unable to sync the database"));
    });
}

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then((data) => resolve(data))
            .catch((err) => reject("no results returned"));
    });
}

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then((data) => resolve(data))
            .catch((err) => reject("no results returned"));
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
        .then((data) => resolve(data[0]))
        .catch((err) => reject("no results returned"));
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                course: course
            }
        })
        .then((data) => resolve(data))
        .catch((err) => reject("no results returned"));
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: {
                courseId: id
            }
        })
        .then((data) => resolve(data[0]))
        .catch((err) => reject("no results returned"));
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure TA property is set appropriately
        studentData.TA = (studentData.TA) ? true : false;
        
        // Set any blank fields to null
        for (const prop in studentData) {
            if (studentData[prop] === "") studentData[prop] = null;
        }

        Student.create(studentData)
            .then(() => resolve())
            .catch((err) => reject("unable to create student"));
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure TA property is set appropriately
        studentData.TA = (studentData.TA) ? true : false;
        
        // Set any blank fields to null
        for (const prop in studentData) {
            if (studentData[prop] === "") studentData[prop] = null;
        }

        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
        .then(() => resolve())
        .catch((err) => reject("unable to update student"));
    });
};

module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        // Set any blank fields to null
        for (const prop in courseData) {
            if (courseData[prop] === "") courseData[prop] = null;
        }

        Course.create(courseData)
            .then(() => resolve())
            .catch((err) => reject("unable to create course"));
    });
};

module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        // Set any blank fields to null
        for (const prop in courseData) {
            if (courseData[prop] === "") courseData[prop] = null;
        }

        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
        .then(() => resolve())
        .catch((err) => reject("unable to update course"));
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: { courseId: id }
        })
        .then(() => resolve())
        .catch((err) => reject("unable to delete course"));
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: { studentNum: studentNum }
        })
        .then(() => resolve())
        .catch((err) => reject("Unable to remove student"));
    });
};
