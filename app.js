// ==========================================
// JEMS - SUPABASE PASS SYSTEM
// ==========================================

// ------------------------------------------
// SUPABASE CONFIG
// ------------------------------------------

const SUPABASE_URL =
    "https://ndabsbxraxkwmgwbvroq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_X-3moJPFNv7sqI3hp1fcMw_3LKmRBfW";

const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ------------------------------------------
// Local current pass
// ------------------------------------------

const CURRENT_PASS_KEY =
    "JEMS_CURRENT_PASS";


// ------------------------------------------
// Generate Pass ID
// ------------------------------------------

function generatePassId() {

    const number =
        Math.floor(
            10000 + Math.random() * 90000
        );

    return "JEMS" + number;

}


// ------------------------------------------
// Validate Mobile
// ------------------------------------------

function isValidMobile(mobile) {

    return /^[6-9]\d{9}$/.test(mobile);

}


// ------------------------------------------
// Show Message
// ------------------------------------------

function showMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById("message");

    if (!messageBox) return;

    messageBox.textContent =
        message;

    messageBox.style.color =
        type === "error"
            ? "red"
            : "green";

}


// ==========================================
// STUDENT REGISTRATION
// ==========================================

const registrationForm =
    document.getElementById(
        "registrationForm"
    );


if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


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
            // Validation
            // ----------------------------------

            if (
                !name ||
                !rollNo ||
                !branch ||
                !year ||
                !mobile
            ) {

                showMessage(
                    "Please fill all fields.",
                    "error"
                );

                return;

            }


            if (!isValidMobile(mobile)) {

                showMessage(
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                return;

            }


            showMessage(
                "Registering student..."
            );


            // ----------------------------------
            // Check duplicate Roll Number
            // ----------------------------------

            const {
                data: existingStudent,
                error: rollError
            } = await db
                .from("students")
                .select("id, roll_no")
                .ilike(
                    "roll_no",
                    rollNo
                )
                .maybeSingle();


            if (rollError) {

                console.error(
                    rollError
                );

                showMessage(
                    "Database error. Please try again.",
                    "error"
                );

                return;

            }


            if (existingStudent) {

                showMessage(
                    "This Roll Number is already registered.",
                    "error"
                );

                return;

            }


            // ----------------------------------
            // Generate Pass ID
            // ----------------------------------

            let passId;
            let passExists = true;


            while (passExists) {

                passId =
                    generatePassId();


                const {
                    data
                } = await db
                    .from("students")
                    .select("id")
                    .eq(
                        "pass_id",
                        passId
                    )
                    .maybeSingle();


                passExists =
                    !!data;

            }


            // ----------------------------------
            // Create Student
            // ----------------------------------

            const student = {

                name: name,

                roll_no: rollNo,

                branch: branch,

                year: year,

                mobile: mobile,

                pass_id: passId,

                payment_status: "PENDING",

                entry_status: "NOT ENTERED"

            };


            // ----------------------------------
            // Save to Supabase
            // ----------------------------------

            const {
                data,
                error
            } = await db
                .from("students")
                .insert(student)
                .select()
                .single();


            if (error) {

                console.error(
                    "Registration error:",
                    error
                );

                showMessage(
                    "Registration failed. Please try again.",
                    "error"
                );

                return;

            }


            // ----------------------------------
            // Save current student locally
            // ----------------------------------

            const currentStudent = {

                id: data.id,

                name: data.name,

                rollNo: data.roll_no,

                branch: data.branch,

                year: data.year,

                mobile: data.mobile,

                passId: data.pass_id,

                paymentStatus:
                    data.payment_status,

                entryStatus:
                    data.entry_status,

                registeredAt:
                    data.registered_at

            };


            localStorage.setItem(
                CURRENT_PASS_KEY,
                JSON.stringify(
                    currentStudent
                )
            );


            // ----------------------------------
            // Success
            // ----------------------------------

            showMessage(
                "Registration successful. Pass ID: " +
                passId
            );


            registrationForm.reset();


            // ----------------------------------
            // Open Pass
            // ----------------------------------

            setTimeout(
                function () {

                    window.location.href =
                        "pass.html";

                },
                800
            );

        }
    );

}


// ==========================================
// GET CURRENT PASS
// ==========================================

function getCurrentStudent() {

    const data =
        localStorage.getItem(
            CURRENT_PASS_KEY
        );


    if (!data) {

        return null;

    }


    try {

        return JSON.parse(data);

    }
    catch {

        return null;

    }

}


// ==========================================
// FIND STUDENT BY PASS ID
// ==========================================

async function findStudentByPassId(
    passId
) {

    const searchId =
        String(passId || "")
            .trim()
            .toUpperCase();


    if (!searchId) {

        return null;

    }


    const {
        data,
        error
    } = await db
        .from("students")
        .select("*")
        .eq(
            "pass_id",
            searchId
        )
        .maybeSingle();


    if (error) {

        console.error(
            "Find student error:",
            error
        );

        return null;

    }


    if (!data) {

        return null;

    }


    return {

        id: data.id,

        name: data.name,

        rollNo: data.roll_no,

        branch: data.branch,

        year: data.year,

        mobile: data.mobile,

        passId: data.pass_id,

        paymentStatus:
            data.payment_status,

        entryStatus:
            data.entry_status,

        registeredAt:
            data.registered_at,

        entryTime:
            data.entry_time

    };

}


// ==========================================
// UPDATE PAYMENT
// ==========================================

async function updatePaymentStatus(
    passId,
    status
) {

    const searchId =
        String(passId || "")
            .trim()
            .toUpperCase();


    const {
        data,
        error
    } = await db
        .from("students")
        .update({

            payment_status:
                String(status)
                    .toUpperCase()

        })
        .eq(
            "pass_id",
            searchId
        )
        .select()
        .maybeSingle();


    if (error) {

        console.error(
            "Payment update error:",
            error
        );

        return false;

    }


    if (!data) {

        return false;

    }


    // Update current pass if it is
    // the same student

    const current =
        getCurrentStudent();


    if (
        current &&
        current.passId === searchId
    ) {

        current.paymentStatus =
            String(status)
                .toUpperCase();


        localStorage.setItem(
            CURRENT_PASS_KEY,
            JSON.stringify(current)
        );

    }


    return true;

}


// ==========================================
// MARK ENTRY
// ==========================================

async function markEntry(
    passId
) {

    const searchId =
        String(passId || "")
            .trim()
            .toUpperCase();


    // ----------------------------------
    // Get latest student
    // ----------------------------------

    const student =
        await findStudentByPassId(
            searchId
        );


    if (!student) {

        return {

            success: false,

            message:
                "Pass not found."

        };

    }


    // ----------------------------------
    // Payment check
    // ----------------------------------

    if (
        String(
            student.paymentStatus
        ).toUpperCase() !== "PAID"
    ) {

        return {

            success: false,

            message:
                "Payment not completed."

        };

    }


    // ----------------------------------
    // Already entered
    // ----------------------------------

    if (
        String(
            student.entryStatus
        ).toUpperCase() ===
        "ENTERED"
    ) {

        return {

            success: false,

            message:
                "Entry already used."

        };

    }


    // ----------------------------------
    // Mark Entry
    // ----------------------------------

    const {
        data,
        error
    } = await db
        .from("students")
        .update({

            entry_status:
                "ENTERED",

            entry_time:
                new Date().toISOString()

        })
        .eq(
            "pass_id",
            searchId
        )
        .eq(
            "entry_status",
            "NOT ENTERED"
        )
        .select()
        .maybeSingle();


    if (error) {

        console.error(
            "Entry update error:",
            error
        );

        return {

            success: false,

            message:
                "Unable to update entry."

        };

    }


    if (!data) {

        return {

            success: false,

            message:
                "Entry could not be confirmed."

        };

    }


    return {

        success: true,

        message:
            "Entry allowed."

    };

}


// ==========================================
// GET ALL STUDENTS
// ==========================================

async function getStudents() {

    const {
        data,
        error
    } = await db
        .from("students")
        .select("*")
        .order(
            "registered_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Get students error:",
            error
        );

        return [];

    }


    return data || [];

}


// ==========================================
// EXPORT
// ==========================================

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

window.db =
    db;