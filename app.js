// ==========================================
// JEMS - PASS SYSTEM
// Student Registration & Pass Management
// ==========================================

const STORAGE_KEY = "JEMS_PASS_STUDENTS";

// ------------------------------------------
// Get all students
// ------------------------------------------

function getStudents() {

    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

}


// ------------------------------------------
// Save all students
// ------------------------------------------

function saveStudents(students) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(students)
    );

}


// ------------------------------------------
// Generate unique Pass ID
// ------------------------------------------

function generatePassId() {

    const students = getStudents();

    let passId;

    do {

        const number = Math.floor(
            10000 + Math.random() * 90000
        );

        passId = "JEMS" + number;

    } while (
        students.some(student => student.passId === passId)
    );

    return passId;

}


// ------------------------------------------
// Validate mobile number
// ------------------------------------------

function isValidMobile(mobile) {

    return /^[6-9]\d{9}$/.test(mobile);

}


// ------------------------------------------
// Show message
// ------------------------------------------

function showMessage(message, type = "success") {

    const messageBox =
        document.getElementById("message");

    if (!messageBox) return;

    messageBox.textContent = message;

    if (type === "error") {

        messageBox.style.color = "red";

    } else {

        messageBox.style.color = "green";

    }

}


// ------------------------------------------
// Registration Form
// ------------------------------------------

const registrationForm =
    document.getElementById("registrationForm");


if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // Get form values

            const name =
                document
                .getElementById("studentName")
                .value
                .trim();


            const rollNo =
                document
                .getElementById("rollNo")
                .value
                .trim();


            const branch =
                document
                .getElementById("branch")
                .value
                .trim();


            const year =
                document
                .getElementById("year")
                .value
                .trim();


            const mobile =
                document
                .getElementById("mobile")
                .value
                .trim();


            // ----------------------------------
            // Basic validation
            // ----------------------------------

            if (
                name === "" ||
                rollNo === "" ||
                branch === "" ||
                year === "" ||
                mobile === ""
            ) {

                showMessage(
                    "Please fill all fields.",
                    "error"
                );

                return;

            }


            // ----------------------------------
            // Mobile validation
            // ----------------------------------

            if (!isValidMobile(mobile)) {

                showMessage(
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                return;

            }


            // ----------------------------------
            // Get existing students
            // ----------------------------------

            const students = getStudents();


            // ----------------------------------
            // Duplicate Roll Number
            // ----------------------------------

            const duplicateRoll =
                students.some(
                    student =>
                        student.rollNo.toLowerCase() ===
                        rollNo.toLowerCase()
                );


            if (duplicateRoll) {

                showMessage(
                    "This Roll Number is already registered.",
                    "error"
                );

                return;

            }


            // ----------------------------------
            // Generate Pass ID
            // ----------------------------------

            const passId = generatePassId();


            // ----------------------------------
            // Create student record
            // ----------------------------------

            const student = {

                id: Date.now(),

                name: name,

                rollNo: rollNo,

                branch: branch,

                year: year,

                mobile: mobile,

                passId: passId,

                paymentStatus: "PENDING",

                entryStatus: "NOT ENTERED",

                registeredAt:
                    new Date().toISOString()

            };


            // ----------------------------------
            // Save student
            // ----------------------------------

            students.push(student);

            saveStudents(students);


            // ----------------------------------
            // Save current student
            // ----------------------------------

            localStorage.setItem(
                "JEMS_CURRENT_PASS",
                JSON.stringify(student)
            );


            // ----------------------------------
            // Show success
            // ----------------------------------

            showMessage(
                "Registration successful. Pass ID: " + passId
            );


            // ----------------------------------
            // Clear form
            // ----------------------------------

            registrationForm.reset();


            // ----------------------------------
            // Redirect after short delay
            // ----------------------------------

            setTimeout(
                function () {

                    window.location.href =
                        "pass.html";

                },
                1200
            );

        }
    );

}


// ------------------------------------------
// Get Current Student
// ------------------------------------------

function getCurrentStudent() {

    const data =
        localStorage.getItem(
            "JEMS_CURRENT_PASS"
        );

    if (!data) {

        return null;

    }

    return JSON.parse(data);

}


// ------------------------------------------
// Find Student By Pass ID
// ------------------------------------------

function findStudentByPassId(passId) {

    const students =
        JSON.parse(
            localStorage.getItem("JEMS_PASS_STUDENTS") || "[]"
        );

    const searchId =
        String(passId || "")
            .trim()
            .toUpperCase();

    return students.find(function(student) {

        const studentPassId =
            String(student.passId || "")
                .trim()
                .toUpperCase();

        return studentPassId === searchId;

    }) || null;
}
// ------------------------------------------
// Update Payment Status
// ------------------------------------------
// This function is reserved for the
// volunteer/admin side.
// Student registration NEVER changes
// payment status automatically.
// ------------------------------------------

function updatePaymentStatus(
    passId,
    status
) {

    const students = getStudents();

    const index =
        students.findIndex(
            student =>
                student.passId.toUpperCase() ===
                passId.toUpperCase()
        );


    if (index === -1) {

        return false;

    }


    students[index].paymentStatus =
        status;


    saveStudents(students);


    const current =
        getCurrentStudent();


    if (
        current &&
        current.passId === passId
    ) {

        current.paymentStatus =
            status;

        localStorage.setItem(
            "JEMS_CURRENT_PASS",
            JSON.stringify(current)
        );

    }


    return true;

}


// ------------------------------------------
// Mark Entry
// ------------------------------------------

function markEntry(passId) {

    const students = getStudents();

    const index =
        students.findIndex(
            student =>
                student.passId.toUpperCase() ===
                passId.toUpperCase()
        );


    if (index === -1) {

        return {
            success: false,
            message: "Pass not found."
        };

    }


    // Payment check

    if (
        students[index].paymentStatus !==
        "PAID"
    ) {

        return {
            success: false,
            message: "Payment not completed."
        };

    }


    // Already entered check

    if (
        students[index].entryStatus ===
        "ENTERED"
    ) {

        return {
            success: false,
            message: "Entry already used."
        };

    }


    students[index].entryStatus =
        "ENTERED";


    students[index].entryTime =
        new Date().toISOString();


    saveStudents(students);


    return {
        success: true,
        message: "Entry allowed."
    };

}


// ------------------------------------------
// Export functions
// ------------------------------------------

window.getStudents =
    getStudents;

window.getCurrentStudent =
    getCurrentStudent;

window.findStudentByPassId =
    findStudentByPassId;

window.updatePaymentStatus =
    updatePaymentStatus;

window.markEntry =
    markEntry;